import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
})
export class DocumentationComponent implements OnInit {
  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}
  info() {
    this.toastr.info('Message / notification INFO', '');
  }
  success() {
    this.toastr.success('Message / notification SUCCESS', '');
  }
  warning() {
    this.toastr.warning('Message / notification WARNING', '');
  }
  error() {
    this.toastr.error('Message / notification ERROR', '');
  }
}
