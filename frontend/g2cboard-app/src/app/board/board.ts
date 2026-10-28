import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowDownFromLine,
  LucideBanknoteArrowDown,
  LucideChevronDown,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';
import { HighchartsChartComponent } from 'highcharts-angular';
import { ListaDevedores } from '../lista-devedores/lista-devedores';
@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [
    LucideArrowDownFromLine,
    LucideUsers,
    LucideTrendingDown,
    LucideTrendingUp,
    LucideCopy,
    LucideBanknoteArrowDown,
    LucideChevronDown,
    HighchartsChartComponent,
  ],
})
export class Board implements OnInit {
  constructor(private readonly router: Router) {}
  openFaturas!: boolean;

  listaDevedores = new ListaDevedores()

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height: 320,
      backgroundColor: 'transparent',
      borderWidth: 0,
      spacing: [20, 10, 10, 10],
      style: {
        fontFamily: 'Inter, sans-serif',
      },
      animation: {
        duration: 800,
      },
    },

    title: {
      text: 'Dívidas',
      align: 'left',
      margin: 24,
      style: {
        color: '#f0f2f5',
        fontSize: '18px',
        fontWeight: '600',
      },
    },

    subtitle: {
      text: 'Acompanhamento mensal',
      align: 'left',
      style: {
        color: '#9298a5',
        fontSize: '12px',
      },
    },

    xAxis: {
      categories: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],
      lineColor: '#292d34',
      tickColor: 'transparent',
      tickLength: 0,
      labels: {
        style: {
          color: '#9298a5',
          fontSize: '11px',
        },
      },
      crosshair: {
        color: 'rgba(188, 242, 39, 0.15)',
        width: 1,
        dashStyle: 'Dash',
      },
    },

    yAxis: {
      title: {
        text: '',
      },
      gridLineColor: '#292d34',
      gridLineDashStyle: 'Dash',
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          color: '#9298a5',
          fontSize: '11px',
        },
      },
    },

    legend: {
      enabled: false,
    },

    tooltip: {
      backgroundColor: '#20232a',
      borderColor: '#3a404a',
      borderRadius: 10,
      borderWidth: 1,
      shadow: true,
      padding: 12,
      headerFormat: '<span style="color:#9298a5;font-size:11px">{point.key}</span><br/>',
      pointFormat:
        '<span style="color:#bcf227">●</span> ' +
        '<span style="color:#f0f2f5">Dívidas: <b>{point.y}</b></span>',
      style: {
        color: '#f0f2f5',
        fontSize: '12px',
      },
    },

    plotOptions: {
      areaspline: {
        lineWidth: 3,
        color: '#bcf227',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 4,
          fillColor: '#bcf227',
          lineColor: '#101216',
          lineWidth: 2,
          states: {
            hover: {
              enabled: true,
              radius: 6,
              lineWidth: 2,
            },
          },
        },
        states: {
          hover: {
            lineWidth: 3,
          },
        },
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, 'rgba(188, 242, 39, 0.22)'],
            [1, 'rgba(188, 242, 39, 0.00)'],
          ],
        },
      },
    },

    series: [
      {
        type: 'areaspline',
        name: 'Dívidas',
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 11, 7],
        color: '#bcf227',
      },
    ],

    credits: {
      enabled: false,
    },

    accessibility: {
      enabled: false,
    },
  };

  openDetalhes(devedorId: string): void {
    if (this.listaDevedores.devedorAbertoId === devedorId) {
      this.listaDevedores.devedorAbertoId = null;
    } else {
      this.listaDevedores.devedorAbertoId = devedorId;
    }
  }

  open() {
    this.router.navigateByUrl('/listadevedores');
  }

  ngOnInit(): void {
    this.listaDevedores.ngOnInit()
  }

  copy(code: string) {
    navigator.clipboard.writeText(code)
  }
}
