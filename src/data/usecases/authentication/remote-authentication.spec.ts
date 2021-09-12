import { HttpPostClientSpy } from "@data/test/mock-http-client";
import { RemoteAuthentication } from "./remote-authentication";
import { mockAuthentication } from "@domain/test/mock-authentication";
import { InvalidCredentialsError } from "@domain/errors/InvalidCredentialsError";
import { HttpStatusCode } from "@data/protocols/http/http-response";
import { UnexpectedError } from "@domain/errors/UnexpectedError";
import { AuthenticationParams } from "@domain/usecases/authentication";
import { AccountModel } from "@domain/models/account-model";

import faker from "faker";

type SutTypes = {
  sut: RemoteAuthentication;
  httpPostClientSpy: HttpPostClientSpy<AuthenticationParams, AccountModel>;
};

const makeSut = (url = faker.internet.url()): SutTypes => {
  const httpPostClientSpy = new HttpPostClientSpy<AuthenticationParams, AccountModel>();
  const sut = new RemoteAuthentication(url, httpPostClientSpy);
  return {
    sut,
    httpPostClientSpy,
  };
};

describe("RemoteAuthentication", () => {
  test("should call HttpPostClient with correct URL", async () => {
    const url = faker.internet.url();
    const { httpPostClientSpy, sut } = makeSut(url);
    await sut.auth(mockAuthentication());
    expect(httpPostClientSpy.url).toBe(url);
  });

  test("should call HttpPostClient with correct body", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    const authenticationParams = mockAuthentication();
    await sut.auth(authenticationParams);
    expect(httpPostClientSpy.body).toEqual(authenticationParams);
  });

  test("should throw InvalidCredentialsError if HttpPostClient returns 401", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    httpPostClientSpy.response = { statusCode: HttpStatusCode.unauthorized };
    const promise = sut.auth(mockAuthentication());
    await expect(promise).rejects.toThrow(new InvalidCredentialsError());
  });
  test("should throw UnexpectedError if HttpPostClient returns 400", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    httpPostClientSpy.response = { statusCode: HttpStatusCode.badRequest };
    const promise = sut.auth(mockAuthentication());
    await expect(promise).rejects.toThrow(new UnexpectedError());
  });

  test("should throw UnexpectedError if HttpPostClient returns 404", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    httpPostClientSpy.response = { statusCode: HttpStatusCode.notFound };
    const promise = sut.auth(mockAuthentication());
    await expect(promise).rejects.toThrow(new UnexpectedError());
  });

  test("should throw UnexpectedError if HttpPostClient returns 500", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    httpPostClientSpy.response = { statusCode: HttpStatusCode.serverError };
    const promise = sut.auth(mockAuthentication());
    await expect(promise).rejects.toThrow(new UnexpectedError());
  });
});
