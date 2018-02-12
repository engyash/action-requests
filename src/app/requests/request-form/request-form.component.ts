import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import * as hash from 'object-hash';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import { Observable } from 'rxjs/Observable';

import { Upload, UploadService } from '../../uploads';
import { ActionRequest } from '../shared';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit {
  currentUpload: Upload;
  photos: Observable<Upload>[];
  uploads: Upload[] = [];

  @Input() request: ActionRequest;
  @Input() showBackButton = false;
  @Input() title: string;

  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();

  @ViewChild('requestForm') requestForm: NgForm;

  categories = [
    'admin', 'assembly', 'engineering', 'priority', 'purchasing', 'shipping', 'vendor', 'welding'
  ];
  statuses = [
    'new',
    'approved',
    'resolved'
  ];

  constructor(
    private location: Location,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    this.getPhotos();
  }

  getPhotos(): void {
    this.photos = this.request.photoHashes
      .map((photoHash: string) => this.uploadService.getUploadByHash(photoHash));
  }

  goBack(): void {
    this.location.back();
  }

  processFiles(event): void {
    const selectedFiles = event.target.files;

    if (!selectedFiles.length) {
      return;
    }

    for (const file of selectedFiles) {
      const upload = new Upload(file);

      this.currentUpload = upload;
      this.uploadService.push(upload);
      this.request.photoHashes.push(upload.fileHash);
      this.uploads.push(upload);
    }

    this.getPhotos();
  }

  save(): void {
    for (const upload of this.uploads) {
      this.request.photoUrls.push(upload.url);
    }

    this.onSave.emit(this.request);

    // HACK: reset form after 1 second to allow time for the Firebase save to complete

    setTimeout(() => {
      this.currentUpload = this.photos = undefined;
      this.uploads = [];
      this.request = new ActionRequest();
      this.requestForm.resetForm();
    }, 1000);

    setTimeout(() => {
      this.request.status = null;
      this.request.status = 'new';
    }, 1100);
  }

}
