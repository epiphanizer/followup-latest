import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { PatientCallQuestionAnswer } from '../patient-call.service';

interface CachedPatientCallQuestionRequest<T> {
  expiresAt: number;
  request$: Observable<T>;
}

export interface PatientCallQuestion {
  patientCallId?: string;
  patientCallQuestionId?: string;
  patientCallQuestion: string;
  patientCallQuestionType: string;
  patientCallQuestionOrder: number;
  patientCallQuestionIsHighlighted: number;
  patientCallQuestionAnswer?: string;
  patientCallQuestionAnswer$?: Observable<PatientCallQuestionAnswer[]>;
  patientQuestionTypeLabel?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PatientCallQuestionsService {
  private readonly cacheTtlMs = 30000;
  private readonly questionRequestCache = new Map<string, CachedPatientCallQuestionRequest<PatientCallQuestion[]>>();
  private readonly answerRequestCache = new Map<
    string,
    CachedPatientCallQuestionRequest<PatientCallQuestionAnswer[]>
  >();
  private readonly hydratedQuestionRequestCache = new Map<
    string,
    CachedPatientCallQuestionRequest<PatientCallQuestion[]>
  >();
  private readonly patientHydratedQuestionRequestCache = new Map<
    string,
    CachedPatientCallQuestionRequest<PatientCallQuestion[]>
  >();

  constructor(private http: HttpService) {}

  private getCachedRequest<T>(
    cache: Map<string, CachedPatientCallQuestionRequest<T>>,
    cacheKey: string,
    requestFactory: () => Observable<T>
  ): Observable<T> {
    const cachedRequest = cache.get(cacheKey);
    if (cachedRequest && cachedRequest.expiresAt > Date.now()) {
      return cachedRequest.request$;
    }

    const request$ = requestFactory().pipe(shareReplay(1));
    cache.set(cacheKey, {
      expiresAt: Date.now() + this.cacheTtlMs,
      request$
    });
    return request$;
  }

  private attachAnswersToQuestions(questions: PatientCallQuestion[]): Observable<PatientCallQuestion[]> {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const questionsNeedingAnswers = safeQuestions.filter(
      (question: PatientCallQuestion) =>
        !!question?.patientCallQuestionId &&
        question.patientCallQuestionAnswer !== '' &&
        question.patientCallQuestionAnswer !== null &&
        question.patientCallQuestionAnswer !== undefined
          ? false
          : true
    );

    if (!questionsNeedingAnswers.length) {
      return of(safeQuestions.map((question: PatientCallQuestion) => ({ ...question })));
    }

    return forkJoin(
      questionsNeedingAnswers.map((question: PatientCallQuestion) =>
        this.getPatientCallQuestionAnswersByPatientCallQuestionId(question.patientCallQuestionId).pipe(
          map((answers: PatientCallQuestionAnswer[] | null) => ({
            questionId: question.patientCallQuestionId,
            answer:
              Array.isArray(answers) && answers.length > 0 ? answers[0].patientCallQuestionAnswer : undefined
          }))
        )
      )
    ).pipe(
      map((resolvedAnswers: Array<{ questionId: string; answer?: string }>) => {
        const answerMap = new Map<string, string | undefined>(
          resolvedAnswers.map(({ questionId, answer }) => [questionId, answer])
        );

        return safeQuestions.map((question: PatientCallQuestion) => ({
          ...question,
          patientCallQuestionAnswer:
            question.patientCallQuestionAnswer !== null &&
            question.patientCallQuestionAnswer !== undefined &&
            question.patientCallQuestionAnswer !== ''
              ? question.patientCallQuestionAnswer
              : answerMap.get(question.patientCallQuestionId)
        }));
      })
    );
  }

  getPatientCallQuestionsByPatientCallId = function(patientCallId: string) {
    const cacheKey = `questions:${patientCallId}`;

    return this.getCachedRequest(this.questionRequestCache, cacheKey, () =>
      this.http.get('patients/calls/' + patientCallId + '/questions').pipe(
        catchError(e => {
          this.questionRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        })
      )
    );
  };

  getPatientCallQuestionsWithAnswersByPatientCallId = function(patientCallId: string) {
    const cacheKey = `hydrated:${patientCallId}`;

    return this.getCachedRequest(this.hydratedQuestionRequestCache, cacheKey, () =>
      this.getPatientCallQuestionsByPatientCallId(patientCallId).pipe(
        switchMap((questions: PatientCallQuestion[]) => this.attachAnswersToQuestions(questions)),
        catchError(e => {
          this.hydratedQuestionRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        })
      )
    );
  };

  getPatientCallQuestionsWithAnswersByPatientId = function(patientId: string) {
    const cacheKey = `patient-hydrated:${patientId}`;

    return this.getCachedRequest(this.patientHydratedQuestionRequestCache, cacheKey, () =>
      this.http.get('patients/' + patientId + '/calls/questions').pipe(
        catchError(e => {
          this.patientHydratedQuestionRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        })
      )
    );
  };

  getPatientCallQuestionAnswersByPatientCallQuestionId = function(patientCallQuestionId: string) {
    const cacheKey = `answers:${patientCallQuestionId}`;

    return this.getCachedRequest(this.answerRequestCache, cacheKey, () =>
      this.http.get('patients/calls/questions/' + patientCallQuestionId + '/answers').pipe(
        catchError(e => {
          this.answerRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        })
      )
    );
  };

  addPatientCallQuestionAnswersByPatientCallQuestionId = function(
    patientCallQuestionId: string,
    patientCallQuestionAnswer: string
  ) {
    return this.http
      .post('patients/calls/questions/' + patientCallQuestionId + '/answers', {
        patientCallQuestionAnswer: patientCallQuestionAnswer ? patientCallQuestionAnswer : ''
      })
      .pipe(
        tap(() => {
          this.answerRequestCache.delete(`answers:${patientCallQuestionId}`);
          this.hydratedQuestionRequestCache.clear();
          this.patientHydratedQuestionRequestCache.clear();
        }),
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };

  private handleAsyncError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      '<div class="alert alert-danger" role="alert"> \
        <strong>Error</strong>: We had trouble connecting to the patient service\
      </div>'
    );
  }
}
