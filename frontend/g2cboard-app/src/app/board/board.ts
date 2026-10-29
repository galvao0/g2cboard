import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
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
import { FiltroChips } from '../filtro-chips/filtro-chips';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [
    LucideUsers,
    LucideTrendingDown,
    LucideTrendingUp,
    LucideCopy,
    LucideBanknoteArrowDown,
    LucideChevronDown,
    LucideChevronUp,
    HighchartsChartComponent,
    FiltroChips,
  ],
})
export class Board {
  private router = inject(Router);
  svc = inject(DevedoresService);

  private baseOptions: Highcharts.Options = {
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
      style: { color: '#f0f2f5', fontSize: '18px', fontWeight: '600' },
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
      labels: { style: { color: '#9298a5', fontSize: '11px' } },
      crosshair: { color: 'rgba(188, 242, 39, 0.15)', width: 1, dashStyle: 'Dash' },
    },

    yAxis: {
      title: { text: '' },
      gridLineColor: '#292d34',
      gridLineDashStyle: 'Dash',
      lineWidth: 0,
      tickWidth: 0,
      labels: { style: { color: '#9298a5', fontSize: '11px' } },
    },

    legend: {
      enabled: true,
      itemStyle: { color: '#9298a5', fontWeight: '400' },
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
          states: { hover: { enabled: true, radius: 6, lineWidth: 2 } },
        },
        states: { hover: { lineWidth: 3 } },
      },
    },

    credits: { enabled: false },
    accessibility: { enabled: false },
  };

  // Recalcula sozinho quando os dados ou o período mudam
  chartOptions = computed<Highcharts.Options>(() => {
    const meses = this.svc.meses();

    return {
      ...this.baseOptions,
      xAxis: {
        ...(this.baseOptions.xAxis as Highcharts.XAxisOptions),
        categories: meses.map((m) => m.rotulo),
      },
      series: [
        {
          type: 'areaspline',
          name: 'Em aberto',
          data: meses.map((m) => m.totalDevedor),
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
          name: 'Recebido',
          data: meses.map((m) => m.totalRecebido),
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

  open() {
    this.router.navigateByUrl('/listadevedores');
  }
}
