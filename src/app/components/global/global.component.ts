import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import { forkJoin } from 'rxjs';
import { RestcountriesService } from 'src/app/services/restcountries/restcountries.service';

interface Continent{
  name: string, population: number
}

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss']
})
export class GlobalComponent {
  continents: string[] = ['europe', 'asia', 'africa', 'america', 'oceania'];
  Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  selectedContinent: string | null = null;

  minPopulation: number | null = null;
  maxPopulation: number | null = null;
  totalPopulation: number | null = null;
  continentPopulation:Continent[] = [];
  continentPopulationFilter: Continent[] = [];

  constructor(private restCountries: RestcountriesService) { }

  ngOnInit() {
    this.getPopulation();

    this.grafica(this.continentPopulation);
  }


  private getPopulation() {
    const requests = this.continents.map(continent =>
      this.restCountries.getPopulationByContinent(continent)
    );

    forkJoin(requests).subscribe({
      next: (populations: number[]) => {
        this.continentPopulation = this.continents.map((continent, index) => ({
          name: continent,
          population: populations[index]
        }));

        this.totalPopulation = this.continentPopulation.reduce((sum, continent) => sum + continent.population, 0);

        this.chartOptions = {
          xAxis: {
            categories: this.continentPopulation.map(continent => this.capitalizeFirstLetter(continent.name)),
            title: {
              text: 'Continente'
            }
          },
          series: [
            {
              type: 'column',
              name: 'Población',
              data: this.continentPopulation.map((continent) => continent.population)
            }
          ]
        };
      },
      error: (error) => {
        console.error('Error al obtener población:', error);
      }
    });
  }

  private grafica(data: Continent[]){
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.map(continent => this.capitalizeFirstLetter(continent.name)),
        title: {
          text: 'Continente'
        }
      },
      yAxis: {
        title: {
          text: 'Población'
        }
      },
      series: [
        {
          type: 'column',
          name: 'Población',
          data: data.map((continent) => continent.population)
        }
      ]
    };
  }

  applyFilter() {
    this.continentPopulationFilter = this.continentPopulation;
    if (this.minPopulation !== null) {
      this.continentPopulationFilter = this.continentPopulationFilter.filter(country => country.population >= this.minPopulation!);
    }

    if (this.maxPopulation !== null) {
      this.continentPopulationFilter = this.continentPopulationFilter.filter(country => country.population <= this.maxPopulation!);
    }

    this.grafica(this.continentPopulationFilter);
  }

  deleteFilter(){
    this.minPopulation=null;
    this.maxPopulation=null;
    this.getPopulation();

    this.grafica(this.continentPopulation);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
