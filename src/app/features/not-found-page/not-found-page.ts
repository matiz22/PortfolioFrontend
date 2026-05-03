import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ContactSection } from '../../shared/contact/contact-section/contact-section';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, Header, Footer, ContactSection],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {}
