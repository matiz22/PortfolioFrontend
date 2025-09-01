import {Pipe, PipeTransform} from '@angular/core';
import {environment} from '../../../enviroments/enviroment';

@Pipe({
  name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {

  transform(relativePath: string | null | undefined): string {
    if (!relativePath) return '';

    if (relativePath.startsWith('http')) {
      return relativePath;
    }

    const baseUrl = environment.storageUrl || '';
    return baseUrl ? `${baseUrl}/${relativePath}` : relativePath;
  }

}
