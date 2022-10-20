import { Injectable, ComponentRef, Component } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute, ParamMap, Router, RoutesRecognized } from '@angular/router';

export interface MenuLink {
  dropdown: any;
  linkIcon?: string;
  linkName: string;
  linkAction: string;
  dynamic: boolean;
  minRole?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  activeComponent: string;
  navLinks: MenuLink[];
  public patientId: string;
  public operationId: string;
  constructor(private route: ActivatedRoute, private router: Router) {}
}
