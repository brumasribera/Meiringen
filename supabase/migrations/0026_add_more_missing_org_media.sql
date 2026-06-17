-- Add reviewed dedicated media for organizations that still used locality or portal defaults.

update public.organizations set
  website_url = 'https://www.jodlerklub-innertkirchen.ch/',
  image_url = '/brand/org-logos/jodlerklub-innertkirchen.static-wixstatic-com.logo.png',
  cover_image_url = '/brand/org-covers/jodlerklub-innertkirchen.static-wixstatic-com.cover.jpg',
  cover_image_credit = 'Jodlerklub Innertkirchen',
  cover_image_credit_url = 'https://www.jodlerklub-innertkirchen.ch/'
where slug = 'jodlerklub-innertkirchen';

update public.organizations set
  website_url = 'https://www.kindergartenverein-meiringen.ch/',
  image_url = '/brand/org-logos/kindergartenverein-meiringen.clubdesk.logo.jpg'
where slug = 'kindergartenverein-meiringen';

update public.organizations set
  website_url = 'https://www.instagram.com/theaterverein__hasliberg/',
  image_url = '/brand/org-logos/theaterverein-hasliberg.scontent-cdninstagram-com.logo.jpg'
where slug = 'theaterverein-hasliberg';

update public.organizations set
  website_url = 'https://www.facebook.com/people/Theaterliit-Gadmen/100069337780253/',
  cover_image_url = '/brand/org-covers/theaterliit-gadmen.scontent-fvlc10-1-fna-fbcdn-net.cover.jpg',
  cover_image_credit = 'Theaterliit Gadmen',
  cover_image_credit_url = 'https://www.facebook.com/people/Theaterliit-Gadmen/100069337780253/'
where slug = 'theaterliit-gadmen';
