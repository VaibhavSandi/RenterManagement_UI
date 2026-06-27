import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingService } from '../../services/parking.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { parkingmodel } from '../../models/parking.model';




@Component({
  selector: 'app-parking-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-details.component.html',
  styleUrls: ['./parking-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingDetailsComponent {

parking:parkingmodel[]=[];


  
    private langSub!: Subscription;
  
    constructor(
  
      private parkingService: ParkingService,
      public lang: LanguageService,
      private cdr: ChangeDetectorRef
    ) {}
  
    ngOnInit(): void {
 
     this.getAllParkingDeatails();
      this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
    }
  
    ngOnDestroy(): void {
      this.langSub?.unsubscribe();
    }



    getAllParkingDeatails():void{

      debugger

      this.parkingService.getAllParkingDeatils().subscribe({

        next: (reponse)=>{

          console.log(JSON.stringify(reponse));
          this.parking=reponse;

      

          this.cdr.markForCheck();
        },
        error: ()=>{

          alert(this.lang.t('fail to laod parking'))
          this.cdr.markForCheck
        }

      });

    }


 




}
