import { Component, OnInit } from "@angular/core";
import { Observable, throwError, timer } from "rxjs";
import {
  catchError,
  delayWhen,
  finalize,
  map,
  retryWhen,
  shareReplay,
} from "rxjs/operators";

import { createHttoObservable } from "../common/util";
import { Course } from "../model/course";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  ngOnInit() {
    const http$ = createHttoObservable("/api/courses");

    const courses$: Observable<Course[]> = http$.pipe(
      catchError((err) => {
        console.log("Error occurred: ", err);
        return throwError(err);
      }),
      finalize(() => {
        console.log("Finalize executed.");
      }),
      map((res) => Object.values(res["payload"])),
      shareReplay(),
      retryWhen((errors) => errors.pipe(delayWhen(() => timer(1000))))
    );

    this.beginnerCourses$ = courses$.pipe(
      map((courses) =>
        courses.filter((course) => course.category === "BEGINNER")
      )
    );

    this.advancedCourses$ = courses$.pipe(
      map((courses) =>
        courses.filter((course) => course.category === "ADVANCED")
      )
    );
  }
}
