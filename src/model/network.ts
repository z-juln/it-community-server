import Router from "koa-router";

export interface Response<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface RouterContext extends Router.RouterContext {
  body: Response | null;
}
