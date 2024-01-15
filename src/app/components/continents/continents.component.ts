import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import { forkJoin } from 'rxjs';
import { RestcountriesService } from 'src/app/services/restcountries/restcountries.service';

interface Continent{
  name: string, population: number
}

@Component({
  selector: 'app-continents',
  templateUrl: './continents.component.html',
  styleUrls: ['./continents.component.scss']
})
export class ContinentsComponent {
  Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  countryData: Continent[] = [];
  countryDataFilter: Continent[] = [];
  minPopulation: number | null = null;
  maxPopulation: number | null = null;
  continentPopulation:number = 0;

  continentImagePaths: { [key: string]: string } = {
    'europe': '../../../assets/img/europe.jpg',
    'asia': '../../../assets/img/asia.png',
    'africa': '../../../assets/img/africa.avif',
    'america': '../../../assets/img/america.jpg',
    'oceania': '../../../assets/img/oceania.avif',
  };
  continentImagePath: string = '';

  @Input() continent: string | null = null;

  constructor(private restCountries: RestcountriesService, private route: ActivatedRoute) { }

  ngOnInit(){
    this.getCountryDataByContinent();

    this.chart(this.countryData);
  }

  private getCountryDataByContinent() {

    this.route.params.subscribe(params => {
      this.continent = params['continent'];
      this.continentImagePath = this.continentImagePaths[this.continent!.toLowerCase()];

      if (this.continent) {
        const countries$ = this.restCountries.getPopulationByCountries(this.continent);

        forkJoin([countries$]).subscribe({
          next: ([countries]) => {
            this.countryData = countries?.map(country => ({
              name: country.name.common,
              population: country.population
            })) || [];

            this.continentPopulation = this.countryData.reduce((total, country) => total + country.population, 0);

            this.chartOptions = {
              xAxis: {
                categories: this.countryData.map(country => country.name),
                title: {
                  text: 'País'
                }
              },
              series: [{
                type: 'column',
                name: 'Población',
                data: this.countryData.map(country => country.population)
              }]
            };
          },
          error: (error) => {
            console.error('Error al obtener datos de países:', error);
          }
        });
      }
    });
  }

  private chart(data: Continent[]){
    this.chartOptions = {
      chart: {
        type: 'bar'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.map(country => country.name),
        title: {
          text: 'Continente'
        }
      },
      yAxis: {
        opposite: true,
        tickPixelInterval: 150,
        title: {
          text: 'Población'
        }
      },
      series: [
        {
          type: 'bar',
          name: 'Población',
          data: data.map(country => country.population)
        }
      ]
    };
  }

  applyFilter() {
    this.countryDataFilter = this.countryData;
    if (this.minPopulation !== null) {
      this.countryDataFilter = this.countryDataFilter.filter(country => country.population >= this.minPopulation!);
    }
    if (this.maxPopulation !== null) {
      this.countryDataFilter = this.countryDataFilter.filter(country => country.population <= this.maxPopulation!);
    }

    this.chart(this.countryDataFilter);
  }

  deleteFilter(){
    this.minPopulation=null;
    this.maxPopulation=null;
    this.getCountryDataByContinent();

    this.chart(this.countryData);
  }
}
