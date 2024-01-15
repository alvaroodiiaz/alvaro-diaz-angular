import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestcountriesService {

  url: string = "https://restcountries.com/v3.1";

  constructor(private http: HttpClient) { }

  getPopulation(){
    return this.http.get(`${this.url}/all?fields=name,population`);
  }

  getPopulationByCountries(continent:string) {
    return this.http.get<any[]>(`${this.url}/region/${continent}?fields=name,population`);
  }

  getPopulationByContinent(continent: string): Observable<number> {

    return this.http.get<any[]>(`${this.url}/region/${continent}?fields=name,population`).pipe(
      map((countries: any[]) => {
        // Calcular la suma de las poblaciones de los países
        return countries.reduce((totalPopulation, country) => {
          return totalPopulation + country.population;
        }, 0);
      })
    );
  }
}
