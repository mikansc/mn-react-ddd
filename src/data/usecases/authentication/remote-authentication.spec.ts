import { HttpPostClientSpy } from "@data/test";
import { RemoteAuthentication } from "./remote-authentication";
import { mockAccountModel, mockAuthentication } from "@domain/test";
import { InvalidCredentialsError, UnexpectedError } from "@domain/errors";
import { HttpStatusCode } from "@data/protocols/http";
import { AuthenticationParams } from "@domain/usecases";
import { AccountModel } from "@domain/models";

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

  test("should return an AccountModel if HttpPostClient returns 200", async () => {
    const { httpPostClientSpy, sut } = makeSut();
    const httpResult = mockAccountModel();
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: httpResult,
    };
    const account = await sut.auth(mockAuthentication());
    expect(account).toEqual(httpResult);
  });
});
