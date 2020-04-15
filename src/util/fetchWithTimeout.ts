export default function (
  input: RequestInfo,
  init?: RequestInit,
  timeout: number = 99000
): Promise<Response> {
  return Promise.race([
    fetch(input, init),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]);
}
