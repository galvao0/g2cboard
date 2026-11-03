import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowDownFromLine,
  LucideBanknoteArrowDown,
  LucideChevronDown,
  LucideChevronUp,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';
import { HighchartsChartComponent } from 'highcharts-angular';
import { DevedoresService } from '../service/devedores/devedores-service';

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
    LucideChevronUp,
    HighchartsChartComponent,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
  ],
})
export class Board implements OnInit {
  openFaturas!: boolean;
  devService = inject(DevedoresService);
  private router = inject(Router);

  private style: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height: 320,
      backgroundColor: 'transparent',
      borderWidth: 0,
      spacing: [20, 10, 10, 10],
      style: { fontFamily: 'Inter, sans-serif' },
      animation: { duration: 800 },
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
      style: { color: '#9298a5', fontSize: '12px' },
    },

    xAxis: {
      lineColor: '#292d34',
      tickColor: 'transparent',
      tickLength: 0,
      labels: {
        style: { color: '#9298a5', fontSize: '11px' },
      },
      crosshair: {
        color: 'rgba(188, 242, 39, 0.15)',
        width: 1,
        dashStyle: 'Dash',
      },
    },

    yAxis: {
      title: { text: '' },
      gridLineColor: '#292d34',
      gridLineDashStyle: 'Dash',
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: { color: '#9298a5', fontSize: '11px' },
      },
    },

    legend: {
      enabled: true,
      itemStyle: {
        color: '#9298a5',
        fontWeight: '400',
      },
      itemHoverStyle: { color: '#f0f2f5' },
    },

    tooltip: {
      shared: true,
      valuePrefix: 'R$ ',
      backgroundColor: '#20232a',
      borderColor: '#3a404a',
      borderRadius: 10,
      borderWidth: 1,
      shadow: true,
      padding: 12,
      style: { color: '#f0f2f5', fontSize: '12px' },
    },

    plotOptions: {
      areaspline: {
        lineWidth: 3,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 4,
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
        states: { hover: { lineWidth: 3 } },
      },
    },

    credits: { enabled: false },
    accessibility: { enabled: false },
  };

  grafico = computed<Highcharts.Options>(() => {
    const data = this.devService.grafico();

    return {
      ...this.style,
      xAxis: {
        ...(this.style.xAxis as Highcharts.XAxisOptions),
        categories: data.mes,
      },
      series: [
        {
          type: 'areaspline',
          name: 'Recebido',
          data: data.rec,
          color: '#bcf227',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(188, 242, 39, 0.22)'],
              [1, 'rgba(188, 242, 39, 0.00)'],
            ],
          },
        },
        {
          type: 'areaspline',
          name: 'Em atraso',
          data: data.dev,
          color: '#5aa9ff',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(90, 169, 255, 0.18)'],
              [1, 'rgba(90, 169, 255, 0.00)'],
            ],
          },
        },
      ],
    };
  });

  openDetalhes() {
    this.openFaturas = !this.openFaturas;
  }

  open() {
    this.router.navigateByUrl('/listadevedores');
  }

  ngOnInit(): void {
    this.devService.devedores().map((d) => {
      d.faturas.map((f) => {
        if(f.status === 'paga') {
          console.log(d.nome)
        }
      })
    })
  }
}
