import {
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NativeScriptCommonModule } from "@nativescript/angular";

@Component({
  selector: "ns-detail",
  templateUrl: "./detail.component.html",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class DetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  description = signal<string>("");

  ngOnInit(): void {
    const id = +this.route.snapshot.params.id;
    console.log("Pizza order id:", id);
    this.description.set(`Order ${id} Delivered!`);
  }
}
