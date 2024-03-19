import { Observable } from "rxjs";

export function createHttoObservable(url: string) {
  return Observable.create((observer) => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          observer.error("Request failed with status: " + response.status);
        }
        return response.json();
      })
      .then((body) => {
        observer.next(body);
        observer.complete();
      })
      .catch((err) => {
        observer.error(err);
      });

    return controller.abort();
  });
}
