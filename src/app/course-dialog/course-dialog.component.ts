import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as moment from "moment";
import { from, fromEvent } from "rxjs";
import { concatMap, exhaustMap, filter } from "rxjs/operators";
import { Course } from "../model/course";

@Component({
  selector: "course-dialog",
  templateUrl: "./course-dialog.component.html",
  styleUrls: ["./course-dialog.component.css"],
})
export class CourseDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  course: Course;

  @ViewChild("saveButton", { static: true }) saveButton: ElementRef;

  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course
  ) {
    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required],
    });
  }

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        concatMap((changes) => this.saveCourse(changes))
      )
      .subscribe();
    // this.form.valueChanges
    //   .pipe(
    //     filter(() => this.form.valid),
    //     mergeMap((changes) => this.saveCourse(changes))
    //   )
    //   .subscribe();
  }

  saveCourse(changes: Course) {
    return from(
      fetch(`/api/courses/${this.course.id}`, {
        method: "PUT",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      })
    );
  }

  ngAfterViewInit() {
    fromEvent(this.saveButton.nativeElement, "click")
      .pipe(exhaustMap(() => this.saveCourse(this.form.value)))
      .subscribe();
  }

  close() {
    this.dialogRef.close();
  }

  save() {}
}
