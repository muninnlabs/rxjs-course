import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, concat, fromEvent, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs/operators";
import { RxJsLoggingLevel, debug, setRxJsLoggingLevel } from "../common/debug";
import { createHttoObservable } from "../common/util";
import { Course } from "../model/course";
import { Lesson } from "../model/lesson";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  courseId: string;
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];

    this.course$ = createHttoObservable(`/api/courses/${this.courseId}`).pipe(
      debug(RxJsLoggingLevel.INFO, "course value")
    );

    setRxJsLoggingLevel(RxJsLoggingLevel.TRACE);
  }

  ngAfterViewInit() {
    const searchLessons$ = fromEvent(this.input.nativeElement, "keyup").pipe(
      // tap(() => console.log("keyup event")),
      map((event: any) => event.target.value),
      debug(RxJsLoggingLevel.TRACE, "search"),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((search) => this.loadLessons(search)),
      debug(RxJsLoggingLevel.DEBUG, "lessons value")
    );

    const initialLessons$ = this.loadLessons();

    const combinedLessons$ = concat(initialLessons$, searchLessons$);

    combinedLessons$.subscribe((lessons) => {
      this.lessons$ = of(lessons);
    });
  }

  loadLessons(search: string = ""): Observable<Lesson[]> {
    // console.log("search", search);
    return (this.lessons$ = createHttoObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`
    ).pipe(map((res) => res["payload"])));
  }
}
