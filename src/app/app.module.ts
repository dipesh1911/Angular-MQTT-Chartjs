import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { NgChartsModule } from 'ng2-charts'
//import { NgChartsModule } from 'ng2-charts/ng2-charts';

import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt'
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions =
{

  hostname: 'device.alteemiot.com',
  port: 89,
  path: '/mqtt',
  connectOnCreate:false
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
