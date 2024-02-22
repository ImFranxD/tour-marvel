import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';


@Injectable({ providedIn: 'root' })
export class HeroService {

  private heroesUrl = 'https://gateway.marvel.com:443/v1/public/characters?ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a';  // URL to web api
  private searchURL = 'https://gateway.marvel.com:443/v1/public/characters';
  private idURL = "https://gateway.marvel.com:443/v1/public/characters/";
  number: number = 0;


  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  getHeroes(): Observable<Hero[]> {
    this.number = Math.floor(Math.random() * Math.floor(1550));
    return this.http.get<Hero[]>(`${this.searchURL}?offset=${this.number}&ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a`)
      .pipe(map((data: any) => data.data.results));
  }

  getHeroeList(term: number): Observable<Hero[]> {
    return this.http.get<Hero[]>(`${this.searchURL}?offset=${term}&ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a`)
      .pipe(map((data: any) => data.data.results));
  }

  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.idURL}${id}?ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]),
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  getHeroById(id: number): Observable<Hero> {
    const url = `${this.idURL}${id}?ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a`;
    return this.http.get<Hero>(url)
    .pipe(map((data: any) => data.data.results[0]));
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.searchURL}?nameStartsWith=${term}&ts=patata&apikey=443829b9ac9c57ff2b6964125b93b81c&hash=40ddafed4cf1f248913dd4bab8177d3a`).pipe(
      map((data: any) => data.data.results),
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`) :
        this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);

      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
