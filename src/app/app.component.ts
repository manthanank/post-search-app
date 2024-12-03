import { SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [FormsModule, SlicePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  searchQuery = '';
  posts: any[] = [];
  filteredPosts: any[] = [];
  loading = false;
  error = false;
  currentPage = 1;
  postsPerPage = 5;
  totalPosts = 0;
  userFilter = '';
  postFilter = '';
  users = [1,2,3,4,5];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchPosts();
  }

  searchPosts() {
    this.loading = true;
    this.error = false;

    this.http
      .get<any[]>(
        `https://jsonplaceholder.typicode.com/posts?q=${this.searchQuery}`
      )
      .pipe(
        debounceTime(300), // Debounce the user input
        switchMap((data) => {
          this.totalPosts = data.length;
          return of(data);
        }),
        catchError(() => {
          this.error = true;
          return of([]);
        })
      )
      .subscribe((data) => {
        this.loading = false;
        this.posts = data;
        this.applyFilters();
      });
  }

  applyFilters() {
    let filtered = this.posts;

    if (this.userFilter) {
      filtered = filtered.filter(
        (post) => post.userId.toString() === this.userFilter
      );
    }

    if (this.postFilter) {
      filtered = filtered.filter(
        (post) => post.id.toString() === this.postFilter
      );
    }

    this.filteredPosts = filtered.slice(
      (this.currentPage - 1) * this.postsPerPage,
      this.currentPage * this.postsPerPage
    );
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchPosts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onRetry() {
    this.searchPosts();
  }

  getPaginationRange() {
    const pageCount = Math.ceil(this.totalPosts / this.postsPerPage);
    return Array(pageCount)
      .fill(0)
      .map((_, index) => index + 1);
  }
}
