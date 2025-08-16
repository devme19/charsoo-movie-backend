export enum Genre {
  ACTION = 'Action', // اکشن
  ADVENTURE = 'Adventure', // ماجراجویی
  ANIMATION = 'Animation', // انیمیشن
  BIOGRAPHY = 'Biography', // زندگینامه
  COMEDY = 'Comedy', // کمدی
  CRIME = 'Crime', // جنایی
  DOCUMENTARY = 'Documentary', // مستند
  DRAMA = 'Drama', // درام
  FAMILY = 'Family', // خانوادگی
  FANTASY = 'Fantasy', // فانتزی
  HISTORY = 'History', // تاریخی
  HORROR = 'Horror', // ترسناک
  MUSIC = 'Music', // موسیقی
  MYSTERY = 'Mystery', // معمایی
  ROMANCE = 'Romance', // عاشقانه
  SCI_FI = 'Sci-Fi', // علمی‌تخیلی
  SPORT = 'Sport', // ورزشی
  THRILLER = 'Thriller', // دلهره‌آور
  WAR = 'War', // جنگی
  WESTERN = 'Western', // وسترن
  MUSICAL = 'Musical', // موزیکال
  GAME_SHOW = 'Game-Show', // مسابقه تلویزیونی
  REALITY_TV = 'Reality-TV', // واقع‌نما (Reality TV)
  NEWS = 'News', // خبری
  TALK_SHOW = 'Talk-Show', // تاک شو
  SHORT = 'Short', // کوتاه
  FILM_NOIR = 'Film-Noir', // فیلم نوآر
  SUPERHERO = 'Superhero', // ابرقهرمانی
  KIDS = 'Kids', // کودکانه
  ANIME = 'Anime', // انیمه
  EROTIC = 'Erotic', // اروتیک
  EXPERIMENTAL = 'Experimental', // تجربی
}
export const GenreLabels: Record<Genre, string> = {
  [Genre.ACTION]: 'اکشن',
  [Genre.ADVENTURE]: 'ماجراجویی',
  [Genre.ANIMATION]: 'انیمیشن',
  [Genre.BIOGRAPHY]: 'زندگینامه',
  [Genre.COMEDY]: 'کمدی',
  [Genre.CRIME]: 'جنایی',
  [Genre.DOCUMENTARY]: 'مستند',
  [Genre.DRAMA]: 'درام',
  [Genre.FAMILY]: 'خانوادگی',
  [Genre.FANTASY]: 'فانتزی',
  [Genre.HISTORY]: 'تاریخی',
  [Genre.HORROR]: 'ترسناک',
  [Genre.MUSIC]: 'موسیقی',
  [Genre.MYSTERY]: 'معمایی',
  [Genre.ROMANCE]: 'عاشقانه',
  [Genre.SCI_FI]: 'علمی‌تخیلی',
  [Genre.SPORT]: 'ورزشی',
  [Genre.THRILLER]: 'دلهره‌آور',
  [Genre.WAR]: 'جنگی',
  [Genre.WESTERN]: 'وسترن',
  [Genre.MUSICAL]: 'موزیکال',
  [Genre.GAME_SHOW]: 'مسابقه تلویزیونی',
  [Genre.REALITY_TV]: 'واقع‌نما (Reality TV)',
  [Genre.NEWS]: 'خبری',
  [Genre.TALK_SHOW]: 'تاک شو',
  [Genre.SHORT]: 'کوتاه',
  [Genre.FILM_NOIR]: 'فیلم نوآر',
  [Genre.SUPERHERO]: 'ابرقهرمانی',
  [Genre.KIDS]: 'کودکانه',
  [Genre.ANIME]: 'انیمه',
  [Genre.EROTIC]: 'اروتیک',
  [Genre.EXPERIMENTAL]: 'تجربی',
};
