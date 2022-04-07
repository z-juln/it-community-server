import Router from "koa-router";

export interface Response<T = any> {
  code: number;
  data: T;
  token?: string;
  message: string;
}

export interface RouterContext<T = any>
  extends Omit<Router.RouterContext, "query"> {
  body: Response<T | null> | null;
  query: {
    [key: string]: string | undefined | string[];
  };
}

export interface PlainQuery {
  [key: string]: string | undefined;
}
