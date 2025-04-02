import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Firestore, Timestamp, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'validSchool',
  standalone: true,
})
export class validSchoolPipe implements PipeTransform {
  transform(user: any, school: any): any {
    if (user && school) {
      if (user?.isAdmin) {
        return true;
      } else if (school?.status?.key === 1) {
        return true;
      }
      return false;
    }
    return false;
  }
}

@Pipe({
  name: 'subCollectionDoc',
  standalone: true,
})
export class subCollectionDocPipe implements PipeTransform {
  constructor(private afs: Firestore) {}
  transform(
    mainCollection: string,
    mKey: string,
    collection: string,
    docKey: string,
    field: string
  ): any {
    if (!docKey) return;
    const ref = doc(
      this.afs,
      `${mainCollection}/${mKey}${collection}/${docKey}`
    );
    return getDoc(ref).then((doc: any) => {
      if (doc.data() !== undefined) {
        const data = field ? doc.data()[field] : null;
        return data;
      } else {
        return null;
      }
    });
  }
}

@Pipe({
  name: 'collectionDoc',
  standalone: true,
})
export class collectionDocPipe implements PipeTransform {
  constructor(private afs: Firestore) {}
  transform(collection: string, docKey: string, field: string): any {
    if (!docKey) return;
    const ref = doc(this.afs, `${collection}/${docKey}`);
    return getDoc(ref).then((doc: any) => {
      if (doc.data() !== undefined) {
        const data = field ? doc.data()[field] : null;
        return data;
      } else {
        return null;
      }
    });
  }
}

@Pipe({
  name: 'removeFirebaseWord',
  standalone: true,
})
export class removeFirebaseWordPipe implements PipeTransform {
  transform(string: any): any {
    if (string) {
      return string.replace(/Firebase:/g, '');
    }
    return null;
  }
}

@Pipe({
  name: 'schoolRoute',
  standalone: true,
})
export class schoolRoutePipe implements PipeTransform {
  transform(schoolKey: string, path: string): any {
    return `/${schoolKey}${path}`;
  }
}


@Pipe({
  name: 'getTextColor',
  standalone: true,
})
export class getTextColorPipe implements PipeTransform {
  transform(backgroundColor: string): any {
    if (!backgroundColor) return;
    const color =
      backgroundColor.charAt(0) === '#'
        ? backgroundColor.substring(1, 7)
        : backgroundColor;
    const r = parseInt(color.substring(0, 2), 16); // Red
    const g = parseInt(color.substring(2, 4), 16); // Green
    const b = parseInt(color.substring(4, 6), 16); // Blue
    const uiColors = [r / 255, g / 255, b / 255];
    const c = uiColors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; // luminance
    return L > 0.179 ? '#000000' : '#ffffff';
  }
}

@Pipe({
  name: 'isChecked',
  standalone: true,
})


@Pipe({
  name: 'isEndBlock',
  standalone: true,
})
export class isEndBlockPipe implements PipeTransform {
  transform(batches: any[], index: number, isSession: boolean = false): any {
    if (!batches || batches.length === 0) {
      return false;
    }
    if (isSession) {
      const currentLevel = batches[index].sessionDay?.key;
      for (let i = index + 1; i < batches.length; i++) {
        if (batches[i].sessionDay?.key !== currentLevel) {
          return true;
        }
        return false;
      }
      return false;
    }
    const currentLevel = batches[index].trainingLevel?.order;
    for (let i = index + 1; i < batches.length; i++) {
      if (batches[i].trainingLevel?.order !== currentLevel) {
        return true;
      }
      return false;
    }
    return false;
  }
}

@Pipe({
  name: 'assets',
})
export class assetsPipe implements PipeTransform {
  constructor(private router: Router) {}
  transform(...path: string[]): any {
    return (
      location.protocol + '//' + location.host + '/assets/' + path?.join('/')
    );
  }
}

@Pipe({
  name: 'sliderPgView',
  standalone: true,
})
export class sliderPgViewPipe implements PipeTransform {
  transform(item: any[], viewPerSlide: number): any {
    if (!item) return [];
    return _.chunk(item, viewPerSlide);
  }
}


@Pipe({
  name: 'khmerDate',
  standalone: true,
})
export class KhmerDatePipe implements PipeTransform {
  private khmerDays = [
    'អាទិត្យ',
    'ច័ន្ទ',
    'អង្គារ',
    'ពុធ',
    'ព្រហស្បតិ៍',
    'សុក្រ',
    'សៅរ៍',
  ];
  private khmerMonths = [
    'មករា',
    'កុម្ភៈ',
    'មីនា',
    'មេសា',
    'ឧសភា',
    'មិថុនា',
    'កក្កដា',
    'សីហា',
    'កញ្ញា',
    'តុលា',
    'វិច្ឆិកា',
    'ធ្នូ',
  ];

  transform(value: Date): string {
    if (!value) {
      return '';
    }

    const dayOfWeek = this.khmerDays[value.getDay()];
    const day = value.getDate();
    const month = this.khmerMonths[value.getMonth()];
    const year = value.getFullYear();
    let hours = value.getHours();
    const minutes = value.getMinutes();
    const period = hours >= 12 ? 'ល្ងាច' : 'ព្រឹក';
    hours = hours % 12 || 12;

    return `ថ្ងៃ${dayOfWeek} ទី${this.convertToKhmerNumerals(
      day
    )} ខែ${month} ឆ្នាំ${this.convertToKhmerNumerals(year)} ${this.formatTime(
      hours
    )}:${this.formatTime(minutes)} ${period}`;
  }

  private convertToKhmerNumerals(value: number): string {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return value
      .toString()
      .split('')
      .map((char) => khmerNumerals[+char])
      .join('');
  }

  private formatTime(value: number): string {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const formattedValue = value < 10 ? '0' + value : value.toString();
    return formattedValue
      .split('')
      .map((char) => khmerNumerals[+char])
      .join('');
  }
}

@Pipe({
  name: 'NumberFormatViewPipe',
  standalone: true,
})
export class NumberFormatViewPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) {
      return '0';
    }

    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; // 1.5M, 2M
    }

    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // 1.5K, 2K
    }

    return value.toString(); // 999, 543
  }
}

@Pipe({
  name: 'translateDayPipe',
  standalone: true,
})
export class translateDayPipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.work_days_en || object?.work_days_kh;
      case 'kh':
        return object?.work_days_kh;
      case 'ch':
        return object?.work_days_ch || object?.work_days_kh;
      default:
        return object?.work_days_kh;
    }
  }
}

@Pipe({
  name: 'translateTopicPipe',
  standalone: true,
})
export class translateTopicPipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.name_en || object?.name_en;
      case 'kh':
        return object?.name;
      case 'ch':
        return object?.name_cn || object?.name_en;
      default:
        return object?.name_en;
    }
  }
}

@Pipe({
  name: 'translateWorksContentTitlePipe',
  standalone: true,
})
export class translateWorksContentTitlePipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.description_works_en || object?.description_works_kh;
      case 'kh':
        return object?.description_works_kh;
      case 'ch':
        return object?.description_works_ch || object?.description_works_kh;
      default:
        return object?.description_works_kh;
    }
  }
}

@Pipe({
  name: 'translateWorksTitlePipe',
  standalone: true,
})
export class translateWorksTitlePipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.works_en || object?.works_kh;
      case 'kh':
        return object?.works_kh;
      case 'ch':
        return object?.works_ch || object?.works_kh;
      default:
        return object?.works_kh;
    }
  }
}

@Pipe({
  name: 'translateAddressPipe',
  standalone: true,
})
export class translateAddressPipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.address_en || object?.address_kh;
      case 'kh':
        return object?.address_kh;
      case 'ch':
        return object?.address_ch || object?.address_kh;
      default:
        return object?.address_kh;
    }
  }
}

@Pipe({
  name: 'translatePipe',
  standalone: true,
})
export class translatePipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.answer_en || object?.answer_kh;
      case 'kh':
        return object?.answer_kh;
      case 'ch':
        return object?.answer_ch || object?.answer_kh;
      default:
        return object?.answer_kh;
    }
  }
}

@Pipe({
  name: 'translateTitleVideoPipe',
  standalone: true,
})
export class translateTitleVideoPipe implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.title_video_en || object?.title_video_kh;
      case 'kh':
        return object?.title_video_kh;
      case 'ch':
        return object?.title_video_ch || object?.title_video_kh;
      default:
        return object?.title_video_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeQuestion',
  standalone: true,
  pure: true,
})
export class translatePipeQuestion implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.question_en || object?.question_kh;
      case 'kh':
        return object?.question_kh;
      case 'ch':
        return object?.question_ch || object?.question_kh;
      default:
        return object?.question_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeTitle',
  standalone: true,
  pure: true,
})
export class translatePipeTitle implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object.title_en || object.title_kh;
      case 'kh':
        return object.title_kh;
      case 'ch':
        return object.title_ch || object.title_kh;
      default:
        return object.title_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeExspansion',
  standalone: true,
  pure: true,
})
export class translatePipeExspansion implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.title_expansion_en || object?.title_expansion_kh;
      case 'kh':
        return object?.title_expansion_kh;
      case 'ch':
        return object?.title_expansion_ch || object?.title_expansion_kh;
      default:
        return object?.title_expansion_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeEpo',
  standalone: true,
  pure: true,
})
export class translatePipeEpo implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.epo_en || object?.epo_kh;
      case 'kh':
        return object?.epo_kh;
      case 'ch':
        return object?.epo_ch || object?.epo_kh;
      default:
        return object?.epo_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeContentExspansion',
  standalone: true,
  pure: true,
})
export class translatePipeContentExspansion implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.content_expansion_en || object?.content_expansion_kh;
      case 'kh':
        return object?.content_expansion_kh;
      case 'ch':
        return object?.content_expansion_ch || object?.content_expansion_kh;
      default:
        return object?.content_expansion_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeTitleFaq',
  standalone: true,
  pure: true,
})
export class translatePipeTitleFaq implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.title_faq_en || object?.title_faq_kh;
      case 'kh':
        return object?.title_faq_kh;
      case 'ch':
        return object?.title_faq_ch || object?.title_faq_kh;
      default:
        return object?.title_faq_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeQuestionFaq',
  standalone: true,
  pure: true,
})
export class translatePipeQuestionFaq implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.question_faq_en || object?.question_faq_kh;
      case 'kh':
        return object?.question_faq_kh;
      case 'ch':
        return object?.question_faq_ch || object?.question_faq_kh;
      default:
        return object?.question_faq_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeContentFaq',
  standalone: true,
  pure: true,
})
export class translatePipeContentFaq implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }

    switch (languages) {
      case 'en':
        return object?.content_faq_en || object?.content_faq_kh;
      case 'kh':
        return object?.content_faq_kh;
      case 'ch':
        return object?.content_faq_ch || object?.content_faq_kh;
      default:
        return object?.content_faq_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeExspansionContent',
  standalone: true,
  pure: true,
})
export class translatePipeExspansionContent implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.content_en || object?.content_kh;
      case 'kh':
        return object?.content_kh;
      case 'ch':
        return object?.content_ch || object?.content_kh;
      default:
        return object?.content_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeBtn',
  standalone: true,
  pure: true,
})
export class translatePipeBtn implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.button_en || object?.button_kh;
      case 'kh':
        return object?.button_kh;
      case 'ch':
        return object?.button_ch || object?.button_kh;
      default:
        return object?.button_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeDescripton',
  standalone: true,
  pure: true,
})
export class translatePipeDescripton implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.description_en || object?.description_kh;
      case 'kh':
        return object?.description_kh;
      case 'ch':
        return object?.description_ch || object?.description_kh;
      default:
        return object?.description_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeButton',
  standalone: true,
  pure: true,
})
export class translatePipeButton implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.button_title_en || object?.button_title_kh;
      case 'kh':
        return object?.button_title_kh;
      case 'ch':
        return object?.button_title_ch || object?.button_title_kh;
      default:
        return object?.button_title_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeName',
  standalone: true,
  pure: true,
})
export class translatePipeName implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.name_en || object?.name_kh;
      case 'kh':
        return object?.name_kh;
      case 'ch':
        return object?.name_ch || object?.name_kh;
      default:
        return object?.name_kh;
    }
  }
}

@Pipe({
  name: 'translatePipeContentShort',
  standalone: true,
  pure: true,
})
export class translatePipeContentShort implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.content_short_en || object?.content_short_kh;
      case 'kh':
        return object?.content_short_kh;
      case 'ch':
        return object?.content_short_ch || object?.content_short_en;
      default:
        return object?.content_short_en;
    }
  }
}

@Pipe({
  name: 'translatePipePostions',
  standalone: true,
  pure: true,
})
export class translatePipePostions implements PipeTransform {
  transform(object: any, languages: any): any {
    if (!object) {
      return '';
    }
    switch (languages) {
      case 'en':
        return object?.positions_en || object?.positions_kh;
      case 'kh':
        return object?.positions_en;
      case 'ch':
        return object?.positions_ch || object?.positions_kh;
      default:
        return object?.positions_kh;
    }
  }
}

@Pipe({
  name: 'capShortText',
  standalone: true,
})
export class CapShortTextPipe implements PipeTransform {
  transform(value: string, maxLength: number = 150): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'capSuperShortText',
  standalone: true,
})
export class CapSuperShortTextPipe implements PipeTransform {
  transform(value: string, maxLength: number = 100): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'capShortTexts',
  standalone: true,
})
export class CapShortTextsPipe implements PipeTransform {
  transform(value: string, maxLength: number = 250): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'textShort',
  standalone: true,
})
export class textShortPipe implements PipeTransform {
  transform(value: string, maxLength: number = 75): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'textShortnewsTxt',
  standalone: true,
})
export class textShortnewsTxtPipe implements PipeTransform {
  transform(value: string, maxLength: number = 50): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'textShortNews',
  standalone: true,
})
export class textShortNewsPipe implements PipeTransform {
  transform(value: string, maxLength: number = 250): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'textShortRemark',
  standalone: true,
})
export class textShortRemarkPipe implements PipeTransform {
  transform(value: string, maxLength: number = 450): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

@Pipe({
  name: 'capShortDesc',
  standalone: true,
})
export class CapShortDescPipe implements PipeTransform {
  transform(value: string, maxLength: number = 100): string {
    if (!value) return value;
    const cleanedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const capitalizedValue = cleanedValue.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    if (capitalizedValue.length > maxLength) {
      return capitalizedValue.substring(0, maxLength) + '...';
    }
    return capitalizedValue;
  }
}

// @Pipe({
//   name: 'getTimeAgo',
//   standalone: true,
// })
// export class GetTimeAgoPipe implements PipeTransform {
//   transform(value: any): string {
//     if (!value) return '';

//     let date: Date;
//     if (value instanceof Timestamp) {
//       date = value?.toDate();
//     } else if (value.seconds && value.nanoseconds) {
//       date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
//     } else {
//       date = new Date(value);
//     }

//     const now = new Date();
//     const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (seconds < 29) return 'មុនពេលនេះ';

//     const intervals: { [key: string]: { singular: string; plural: string } } = {
//       year: { singular: 'ឆ្នាំ', plural: 'ឆ្នាំ' },
//       month: { singular: 'ខែ', plural: 'ខែ' },
//       week: { singular: 'សប្ដាហ៍', plural: 'សប្ដាហ៍' },
//       day: { singular: 'ថ្ងៃ', plural: 'ថ្ងៃ' },
//       hour: { singular: 'ម៉ោង', plural: 'ម៉ោង' },
//       minute: { singular: 'នាទី', plural: 'នាទី' },
//       second: { singular: 'វិនាទី', plural: 'វិនាទី' },
//     };

//     for (const key in intervals) {
//       const interval = intervals[key];
//       const intervalSeconds = this.getIntervalInSeconds(key);
//       const counter = Math.floor(seconds / intervalSeconds);
//       if (counter > 0) {
//         if (counter === 1) {
//           return `${counter} ${interval.singular}`;
//         } else {
//           return `${counter} ${interval.plural}`;
//         }
//       }
//     }

//     return '';
//   }

//   private getIntervalInSeconds(interval: string): number {
//     switch (interval) {
//       case 'year':
//         return 31536000;
//       case 'month':
//         return 2592000;
//       case 'week':
//         return 604800;
//       case 'day':
//         return 86400;
//       case 'hour':
//         return 3600;
//       case 'minute':
//         return 60;
//       case 'second':
//         return 1;
//       default:
//         return 1;
//     }
//   }
// }
@Pipe({
  name: 'getTimeAgo',
  standalone: true,
  pure: false
})
export class GetTimeAgoPipe implements PipeTransform {
  private languageChangeSubscription: Subscription;

  constructor(private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.languageChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(value: any): string {
    if (!value) return '';

    let date: Date;
    if (value instanceof Timestamp) {
      date = value?.toDate();
    } else if (value.seconds && value.nanoseconds) {
      date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    } else {
      date = new Date(value);
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 29) return this.translate.instant('Now');

    const intervals: Record<'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second', string> = {
      year: 'Year',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      hour: 'Hour',
      minute: 'Minute',
      second: 'Second',
    };

    for (const key in intervals) {
      if (intervals.hasOwnProperty(key)) {
        const intervalSeconds = this.getIntervalInSeconds(key as keyof typeof intervals);
        const counter = Math.floor(seconds / intervalSeconds);
        if (counter > 0) {
          const singularKey = intervals[key as keyof typeof intervals];
          const pluralKey = intervals[key as keyof typeof intervals];
          const translationKey = counter === 1 ? singularKey : pluralKey;

          return `${counter} ${this.translate.instant(translationKey)}`;
        }
      }
    }

    return '';
  }

  private getIntervalInSeconds(interval: any): number {
    switch (interval) {
      case 'year':
        return 31536000;
      case 'month':
        return 2592000;
      case 'week':
        return 604800;
      case 'day':
        return 86400;
      case 'hour':
        return 3600;
      case 'minute':
        return 60;
      case 'second':
        return 1;
      default:
        return 1;
    }
  }

  ngOnDestroy() {
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
    }
  }
}
@Pipe({
  name: 'Date',
  standalone: true,
})
export class DatedPipe implements PipeTransform {
  transform(
    value: Timestamp | null,
    format: string = 'fullDate'
  ): string | null {
    if (!value) return null;

    const date = value?.toDate();

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}


@Pipe({
  name: 'isImageBase64',
  standalone: true,
})
export class IsImageBase64Pipe implements PipeTransform {
  transform(base64: string): boolean {
    return base64?.startsWith('data:image') || false;
  }
}

@Pipe({
  name: 'toFileSizeStr',
  standalone: true,
})
export class ToFileSizeStrPipe implements PipeTransform {
  transform(size: number): string {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
      Number((size / Math.pow(1024, i)).toFixed(2)) +
      ' ' +
      ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  }
}

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.linkify(text));
  }

  private linkify(text: string): string {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text
      .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
      ?.replace?.(/\n/g, '<br>');
  }
}

@Pipe({
  name: 'getFirstLastItem',
  standalone: true,
})
export class getFirstLastItemPipe implements PipeTransform {
  transform(data: any[], item: any, isFirst: boolean) {
    if (isFirst) {
      if (!data) return false;
      const preItem = data.find((f) => f.index === item?.index - 1);
      const val = item?.index === 0 || preItem?.senderKey !== item?.senderKey;
      return val;
    } else {
      if (!data) return false;
      const nextItem = data.find((f) => f.index === item?.index + 1);
      const val =
        item?.index === data?.length - 1 ||
        nextItem?.senderKey !== item?.senderKey ||
        item?.isLast;
      return val;
    }
  }
}

@Pipe({
  name: 'isOdd',
  standalone: true,
})
export class isOddPipe implements PipeTransform {
  transform(num: number) {
    if (num % 2 !== 0) {
      return true;
    } else {
      return false;
    }
  }
}

@Pipe({
  name: 'fromNow',
  standalone: true,
})
export class FromNowPipe implements PipeTransform {
  transform(date: Date, kh?: boolean, type?: 'date' | 'time') {
    if (!date) return null;
    const AT = kh ? 'ម៉ោង' : 'at';
    if (type === 'date') {
      return moment(date)
        .locale(kh ? 'km' : 'en')
        .calendar('', {
          sameDay: `[${kh ? 'ថ្ងៃនេះ' : 'Today'}]`,
          nextDay: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY`,
          nextWeek: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY`,
          lastDay: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY`,
          lastWeek: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY`,
          sameElse: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY`,
        });
    } else if (type === 'time') {
      return moment(date)
        .locale(kh ? 'km' : 'en')
        .format('hh:mm A');
    } else {
      return moment(date)
        .locale(kh ? 'km' : 'en')
        .calendar('', {
          sameDay: `[${kh ? 'ថ្ងៃនេះ' : 'Today'}] [${AT}] h:mm A`,
          nextDay: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY [${AT}] h:mm A`,
          nextWeek: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY [${AT}] h:mm A`,
          lastDay: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY [${AT}] h:mm A`,
          lastWeek: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY [${AT}] h:mm A`,
          sameElse: `[${kh ? 'ថ្ងៃទី' : ''}]DD MMMM YYYY [${AT}] h:mm A`,
        });
    }
  }
}

@Pipe({
  name: 'allowChat',
  standalone: true,
})
export class allowChatPipe implements PipeTransform {
  transform(data: any, userKey: string): boolean {
    const { status, start_by_key } = data;
    if (
      status?.key === 2 &&
      start_by_key?.length > 0 &&
      start_by_key?.includes(userKey)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

@Pipe({
  name: 'checkAppRoute',
  standalone: true,
})
export class checkAppRoutePipe implements PipeTransform {
  transform(route: any, appKey: string): any {
    console.log(route, appKey);
    if (appKey) {
      return '/admin/gdi/' + appKey + '/';
    } else {
      return route;
    }
  }
}

@Pipe({
  name: 'translatePipeProvince',
  standalone: true,
  pure: true,
})
export class translatePipeProvince implements PipeTransform {
  transform(object: any, languages: any): any {
    switch (languages) {
      case 'en':
        return object?.en_name;
      case 'km':
        return object?.name;
      default:
        return object?.name;
    }
  }
}

@Pipe({
  name: 'translatePipeResidenceName',
  standalone: true,
  pure: true,
})
export class translatePipeResidenceName implements PipeTransform {
  transform(object: any, languages: any): any {
    switch (languages) {
      case 'en':
        return object?.en_name;
      case 'km':
        return object?.name || object?.en_name;
      default:
        return object?.name;
    }
  }
}

@Pipe({
  name: 'translatePipeResidence',
  standalone: true,
  pure: true,
})
export class translatePipeResidence implements PipeTransform {
  transform(object: any, languages: any): any {
    switch (languages) {
      case 'en':
        return object?.en_name;
      case 'km':
        return object?.name;
      default:
        return object?.name;
    }
  }
}

@Pipe({
  name: 'phoneNumberFormat',
  standalone: true,
  pure: true,
})
export class PhoneNumberFormatPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if the number starts with "855" and format accordingly
    const match1 = cleaned.match(/^855(\d{2})(\d{3})(\d{3,4})$/);
    const match2 = cleaned.match(/(\d{3})(\d{3})(\d{3,4})$/);

    if (match1) {
      return `+855 (${match1[1]}) ${match1[2]}-${match1[3]}`;
    } else if (match2) {
      return `(${match2[1]}) ${match2[2]}-${match2[3]}`;
    }
    return phoneNumber; // Return the original input if it doesn't match the expected pattern
  }
}