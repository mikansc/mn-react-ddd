/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockAxios } from "@infra/test";
import { mockPostRequest } from "@data/test";
import { AxiosHttpClient } from "./axios-http-client";

import axios from "axios";
jest.mock("axios");

type SutType = {
  sut: AxiosHttpClient;
  mockedAxios: jest.Mocked<typeof axios>;
};

const makeSut = (): SutType => {
  const sut = new AxiosHttpClient();
  const mockedAxios = mockAxios();
  return {
    sut,
    mockedAxios,
  };
};

describe("AxiosHttpClient", () => {
  test("should call axios with correct params and verb", async () => {
    const request = mockPostRequest();
    const { sut, mockedAxios } = makeSut();
    await sut.post(request);
    expect(mockedAxios.post).toHaveBeenCalledWith(request.url, request.body);
  });

  test("should return the correct status code and body", async () => {
    const { sut, mockedAxios } = makeSut();
    const promise = sut.post(mockPostRequest());
    expect(promise).toEqual(mockedAxios.post.mock.results[0].value);
  });
});
