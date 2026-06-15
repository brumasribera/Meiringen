-- English descriptions and local logo cleanup for newly added Haslital orgs

update public.organizations set
  description_en = 'Running club for children and adults in Willigen with free training sessions, races and regional running activities.'
where slug = 'laufgruppe-willigen';

update public.organizations set
  description_en = 'Women''s association in Willigen that supports village life, community activities and offers for older residents.'
where slug = 'frauenverein-willigen';

update public.organizations set
  description_en = 'Samaritan association with courses, blood donation campaigns and medical standby services in Meiringen.'
where slug = 'samariterverein-meiringen';

update public.organizations set
  description_en = 'Equestrian club for horse sport, leisure riding and riding events in Oberhasli and Brienz.'
where slug = 'reitverein-oberhasli-brienz';

update public.organizations set
  description_en = 'Support association for local kindergartens in Meiringen through second-hand sales, donations and member contributions.'
where slug = 'kindergartenverein-meiringen';

update public.organizations set
  description_en = 'Regional business association for SMEs in Oberhasli with networking, policy and location promotion.'
where slug = 'berner-kmu-oberhasli';

update public.organizations set
  description_en = 'Local retail association supporting small businesses and village commerce in Meiringen.'
where slug = 'dvo-detaillistenverein-oberhasli';

update public.organizations set
  description_en = 'Fishery association for habitat care, fish stock and youth work in Oberhasli.'
where slug = 'fischereiverein-oberhasli';

update public.organizations set
  description_en = 'Young Haslital residents helping shape weekend and leisure activities in the region.'
where slug = 'dynamo-wiggaefisch';

update public.organizations set
  description_en = 'Wrestling club from Oberhasli with youth and competitive activities.'
where slug = 'ringclub-oberhasli';

update public.organizations set
  description_en = 'Life-saving swimming, first aid and water training for the Brienz-Meiringen region.'
where slug = 'slrg-sektion-thun-oberland-aussenstation-brienz-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/meiringen-ch.png'
where slug in ('kindergartenverein-meiringen', 'dvo-detaillistenverein-oberhasli');

update public.organizations set
  image_url = '/brand/org-logos/haslital-brienz-ch.png'
where slug in ('dynamo-wiggaefisch', 'ringclub-oberhasli');

update public.organizations set
  image_url = '/brand/org-logos/laufgruppe-willigen.instagram.jpg'
where slug = 'laufgruppe-willigen';

