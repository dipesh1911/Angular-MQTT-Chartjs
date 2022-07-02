import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,

} from '@angular/core'

import { Observable, Observer, Subscription } from 'rxjs'
import { IMqttMessage, MqttService, MqttConnectionState } from 'ngx-mqtt'
import { __values } from 'tslib'
import { Chart, ChartType } from 'chart.js'
import { Crc16ItuCalculator } from './crc16'
import { communication } from './communication'
import { customer } from './AllModel'
import { InvokeFunctionExpr } from '@angular/compiler'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title(title: any) {
    throw new Error('Method not implemented.')
  }
  crc: Crc16ItuCalculator = new Crc16ItuCalculator()
  custInfo: customer = new customer()
  myCom: communication = new communication()
  abc: any = [0]
  connected: boolean = false
  private subscription: Subscription | any
  topic1: string = 'R/notify/#'
  topic2: string = 'R/info/#'
  connect: any
  msg: any
  msgcount: number = 0
  chartDrawn: number = 0
  chartProcessing: boolean = false
  gateSeries_Mst: any = []
  gateSeries_Slv: any = []

  @ViewChild('msglog', { static: true }) msglog: ElementRef | any
  showVar: boolean = true

  constructor(private _mqttService: MqttService) { }

  public lineChartLabels = [0]
  public lineChartType: ChartType = 'line'
  public lineChartLegend = true
  public lineChartData = [
    {
      data: [],
      label: 'Line Chart',
    },
  ]


  MyChart: any = []
  ngOnInit(): void {
    this.initChart()
    this.showStatus()
    this._mqttService.connect()
    this.subscribeToTopic()
  }

  showStatus() {
    this._mqttService.onConnect.subscribe((s: MqttConnectionState) => {
      this.connect = s ? 'CONNECTED' : 'CONNECTING'
      //this.connect = s;
      if (this.connect == 'CONNECTED') {
        this._mqttService.observe(this.topic1)
        this._mqttService.observe(this.topic2)
      }

    });
    this._mqttService.onReconnect.subscribe((s: MqttConnectionState) => {
      this.connect = s ? 'CONNECTING' : 'CLOSED'
    })
    this._mqttService.onClose.subscribe((s: MqttConnectionState) => {
      this.connect = s ? 'CLOSED' : 'CONNECTING'
    })
  }
  subscribeToTopic() {


    this.subscription = this._mqttService.observe(this.topic1).subscribe(async (message: IMqttMessage) => {
      this.msgcount++
      this.setData(message)
    })
    /*
    this.subscription = this._mqttService.observe(this.topic2).subscribe(async (message: IMqttMessage) => {
      this.custInfo = JSON.parse(message.payload.toString())
      console.log(this.custInfo.CUST)
    })
    */


  }
  initChart() {
    for (var i = 1; i < 800; i++) {
      this.lineChartLabels.push(i)
    }
    if (this.MyChart instanceof Chart) {
      this.MyChart.destroy()
    }
    for (var i = 1; i < 800; i++) {
      if (i < 300 || i > 400) {
        this.gateSeries_Mst.push(0)
      } else {
        this.gateSeries_Mst.push(4000)
      }
      if (i < 450 || i > 500) {
        this.gateSeries_Slv.push(0)
      } else {
        this.gateSeries_Slv.push(4000)
      }
    }
    this.MyChart = new Chart('myCanvas', {
      type: 'line',


      data: {
        labels: this.lineChartLabels,
        datasets: [
          {
            data: this.abc,
            borderColor: ['#000', '#111', '#fff'],
            pointBackgroundColor: 'white',
            pointRadius: 1,

          },
          {
            data: this.gateSeries_Mst,
            borderColor: 'red',
            backgroundColor: 'red',
            pointBackgroundColor: 'red',
            //new option, barline will default to bar as that what is used to create the scale
          },
          {
            data: this.gateSeries_Slv,
            borderColor: 'yellow',
            backgroundColor: 'yellow',
            pointBackgroundColor: 'yellow',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'white'
            }
          },
          y: {
            ticks: {
              color: 'white'
            }
          }
        }
      },
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
  async setData(myMsg: IMqttMessage) {
    this.abc = []

    for (var i = 6; i < myMsg.payload.length - 2; i += 2) {
      var int16Data = myMsg.payload[i + 1] * 256 + myMsg.payload[i]
      this.abc.push(int16Data)
    }
    console.log(this.abc)

    if (this.chartProcessing == false) {
      await this.DrawChart()
    }
  }
  async DrawChart() {
    this.chartProcessing = true
    this.lineChartData[0].data = this.abc
    this.MyChart.data.datasets[0].data = this.abc
    this.MyChart.update()
  }


  subscribe() {
    this.subscription = this
  }

  sendmsg(): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish("R/notify/#", this.msg, {
      qos: 1,
      retain: true,
    })

    this.msg = ''
  }

  logMsg(message: any): void {
    this.msglog.nativeElement.innerHTML = '<br><hr>' + message
  }

  clear(): void {
    this.msglog.nativeElement.innerHTML = ''
  }

  //all buttons click event

  rescanButton() {
    this.showVar = !this.showVar
  }
}
