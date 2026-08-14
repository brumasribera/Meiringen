import type { Event } from "@/lib/types";

const RESEARCHED_AT = "2026-08-14T00:00:00.000Z";

type StaticEventInput = Pick<
  Event,
  | "id"
  | "organization_slug"
  | "title"
  | "slug"
  | "description"
  | "category"
  | "start_date"
  | "end_date"
  | "location_name"
  | "address"
  | "price"
  | "language"
  | "is_recurring"
  | "source_url"
  | "image_url"
>;

function event(input: StaticEventInput): Event {
  return {
    organization_id: null,
    latitude: null,
    longitude: null,
    is_recurring_template: false,
    recurrence_parent_id: null,
    recurrence_interval_days: 0,
    recurrence_description: null,
    status: "published",
    created_at: RESEARCHED_AT,
    updated_at: RESEARCHED_AT,
    organization: null,
    is_static_curated: true,
    ...input,
  };
}

const MARKET_IMAGE_15 =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/5/21/d9/521d90feffbed0719dc66f4e6cea3ea70df208a9_933818209.jpg";
const MARKET_IMAGE_22 =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/c6/12/dc612ff5d07da8c47a8302dd3a9aa9ca7172e646_933818208.jpg";
const MARKET_IMAGE_SEP_5 =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/5/31/d6/531d61f95f66838798ed21a87a144583b3a81fa9_933591175.jpg";
const MARKET_IMAGE_SEP_19 =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/2/0e/5b/20e5b4e4a48a5cbaa7087ab126a9f23389545661_933591173.jpg";
const MICHAELSKIRCHE_IMAGE =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/f9/13/df913de9ada697a184dedc147712fbe236d31f73_802413338.jpg";
const WEIN_IMAGE =
  "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/0/6b/26/06b26ae9a28fc2e72555bff68870d3302878b355_926016497.jpg";

const KINO_ORGANIZATION_SLUG = "kino-meiringen";
const GEMEINDE_MEIRINGEN_SLUG = "gemeinde-meiringen";
const MUSIKGESELLSCHAFT_MEIRINGEN_SLUG = "musikgesellschaft-meiringen";
const SV_MEIRINGEN_SLUG = "sv-meiringen";
const KINO_ADDRESS = "Kirchgasse 7, 3860 Meiringen";
const KINO_STANDARD_PRICE = "CHF 14 / 11";
const KINO_ALLIANZ_PRICE = "CHF 7";
const KINO_SPECIAL_PRICE = "CHF 5";
const KINO_STAGE_PRICE = "CHF 30 / 20";

type KinoEventInput = Omit<
  StaticEventInput,
  | "organization_slug"
  | "location_name"
  | "address"
  | "language"
  | "is_recurring"
  | "source_url"
> & {
  source_slug?: string;
};

function kinoEvent(input: KinoEventInput): Event {
  const { source_slug, ...eventInput } = input;

  return event({
    ...eventInput,
    organization_slug: KINO_ORGANIZATION_SLUG,
    location_name: "Kino Meiringen",
    address: KINO_ADDRESS,
    language: "de",
    is_recurring: false,
    source_url: `https://www.kino-meiringen.ch/events/${
      source_slug ?? input.slug
    }`,
  });
}

const KINO_CURATED_EVENTS: Event[] = [
  kinoEvent({
    id: "static-kino-marcel-huwyler-2026-08-14",
    title: "Marcel Huwyler: Autor",
    slug: "marcel-huwyler-autor-2026-08-14",
    source_slug: "marcel-huwyler-autor",
    description:
      "Lesung mit Marcel Huwyler und seinen Mordsfiguren, mit Barbetrieb ab 19:00 Uhr.",
    category: "culture",
    start_date: "2026-08-14T18:00:00.000Z",
    end_date: "2026-08-14T20:00:00.049Z",
    price: KINO_STAGE_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_a4ebac67d3de4f67b692786c90f8150a~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-toy-story-5-2026-08-15-17-00",
    title: "Toy Story 5",
    slug: "toy-story-5-2026-08-15-17-00",
    description:
      "Animationsfilm in deutscher Sprache, empfohlen ab 6 Jahren.",
    category: "cinema",
    start_date: "2026-08-15T15:00:00.000Z",
    end_date: "2026-08-15T16:45:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_054e95bc76a14871b2f9cec3eb01fdd3~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-vaiana-live-action-2026-08-15-20-00",
    title: "Vaiana (Live Action)",
    slug: "vaiana-live-action-2026-08-15-20-00",
    description:
      "Abenteuerfilm in deutscher Sprache, Realverfilmung nach dem Animationsfilm.",
    category: "cinema",
    start_date: "2026-08-15T18:00:00.000Z",
    end_date: "2026-08-15T20:00:00.602Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_eeb8f6fd5c0a44cc8bd137fcb63035e8~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-diamanti-2026-08-16-19-00",
    title: "Diamanti",
    slug: "diamanti-2026-08-16-19-00",
    description:
      "Italienisches Drama von Ferzan Ozpetek, italienisch mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-16T17:00:00.000Z",
    end_date: "2026-08-16T19:30:00.416Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_44f1c97b402b4c88971018640f5d2cfb~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-amarga-navidad-2026-08-17-20-00",
    title: "Amarga Navidad",
    slug: "amarga-navidad-2026-08-17-20-00",
    description:
      "Spanisches Drama von Pedro Almodovar, Originalversion mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-17T18:00:00.000Z",
    end_date: "2026-08-17T20:10:00.597Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_d6459100645a4d6cb4bad54816a88f4d~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-toy-story-5-2026-08-19-14-00",
    title: "Toy Story 5",
    slug: "toy-story-5-2026-08-19-14-00",
    description:
      "Nachmittagsvorstellung des Animationsfilms in deutscher Sprache.",
    category: "cinema",
    start_date: "2026-08-19T12:00:00.000Z",
    end_date: "2026-08-19T13:45:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_054e95bc76a14871b2f9cec3eb01fdd3~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-amarga-navidad-2026-08-20-20-00",
    title: "Amarga Navidad",
    slug: "amarga-navidad-2026-08-20-20-00",
    description:
      "Spanisches Drama von Pedro Almodovar, Originalversion mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-20T18:00:00.000Z",
    end_date: "2026-08-20T20:10:00.597Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_d6459100645a4d6cb4bad54816a88f4d~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-becaaria-2026-08-21-20-00",
    title: "Becaària",
    slug: "becaaria-2026-08-21-20-00",
    description:
      "Schweizer Drama in italienischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-21T18:00:00.000Z",
    end_date: "2026-08-21T20:00:00.817Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_18d57fd2e82e47c694a6b585da80a8c1~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-ingeborg-bachmann-2026-08-22-17-00",
    title: "Ingeborg Bachmann - Jemand, der einmal ich war",
    slug: "ingeborg-bachmann-jemand-der-einmal-ich-war-2026-08-22-17-00",
    description:
      "Dokumentarfilm von Regina Schilling mit Sandra Huller.",
    category: "cinema",
    start_date: "2026-08-22T15:00:00.000Z",
    end_date: "2026-08-22T16:40:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_06ebf37c4b1e4d26aee632b21c4e188e~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-diamanti-2026-08-22-20-00",
    title: "Diamanti",
    slug: "diamanti-2026-08-22-20-00",
    description:
      "Italienisches Drama von Ferzan Ozpetek, italienisch mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-22T18:00:00.000Z",
    end_date: "2026-08-22T20:30:00.416Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_44f1c97b402b4c88971018640f5d2cfb~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-becaaria-2026-08-24-20-00",
    title: "Becaària",
    slug: "becaaria-2026-08-24-20-00",
    description:
      "Schweizer Drama in italienischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-24T18:00:00.000Z",
    end_date: "2026-08-24T20:00:00.817Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_18d57fd2e82e47c694a6b585da80a8c1~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-wann-wird-es-endlich-2026-08-25",
    title: "Wann wird es endlich so wie es nie war",
    slug: "wann-wird-es-endlich-so-wie-es-nie-war-2026-08-25",
    source_slug: "wann-wird-es-endlich-so-wie-es-nie-war",
    description:
      "Filmabend zum Thema Familienportrait, anschliessend Gesprach/Diskussion mit Fachpersonen.",
    category: "cinema",
    start_date: "2026-08-25T17:00:00.000Z",
    end_date: "2026-08-25T19:00:00.171Z",
    price: KINO_SPECIAL_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_5909280ddd124bda9ca11070c56c0e92~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-ingeborg-bachmann-2026-08-27-20-00",
    title: "Ingeborg Bachmann - Jemand, der einmal ich war",
    slug: "ingeborg-bachmann-jemand-der-einmal-ich-war-2026-08-27-20-00",
    description:
      "Dokumentarfilm von Regina Schilling mit Sandra Huller.",
    category: "cinema",
    start_date: "2026-08-27T18:00:00.000Z",
    end_date: "2026-08-27T19:50:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_06ebf37c4b1e4d26aee632b21c4e188e~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-vaiana-live-action-2026-08-28-20-00",
    title: "Vaiana (Live Action)",
    slug: "vaiana-live-action-2026-08-28-20-00",
    description:
      "Abenteuerfilm in deutscher Sprache, Realverfilmung nach dem Animationsfilm.",
    category: "cinema",
    start_date: "2026-08-28T18:00:00.000Z",
    end_date: "2026-08-28T20:00:00.602Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_eeb8f6fd5c0a44cc8bd137fcb63035e8~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-a-sad-and-beautiful-world-2026-08-29-17-00",
    title: "A Sad and Beautiful World",
    slug: "a-sad-and-beautiful-world-2026-08-29-17-00",
    description:
      "Libanesischer Romance-Film in Originalversion mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-29T15:00:00.000Z",
    end_date: "2026-08-29T17:00:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_3576d308bc75424fa196a07ef08f9512~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-laundry-2026-08-29-20-00",
    title: "Laundry",
    slug: "laundry-2026-08-29-20-00",
    description:
      "Schweizer Drama in englischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-29T18:00:00.000Z",
    end_date: "2026-08-29T20:00:00.307Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_6a1808605de54e90889de4d0ecbbbe04~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-a-sad-and-beautiful-world-2026-08-30-19-00",
    title: "A Sad and Beautiful World",
    slug: "a-sad-and-beautiful-world-2026-08-30-19-00",
    description:
      "Libanesischer Romance-Film in Originalversion mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-30T17:00:00.000Z",
    end_date: "2026-08-30T19:00:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_3576d308bc75424fa196a07ef08f9512~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-laundry-2026-08-31-20-00",
    title: "Laundry",
    slug: "laundry-2026-08-31-20-00",
    description:
      "Schweizer Drama in englischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-08-31T18:00:00.000Z",
    end_date: "2026-08-31T20:00:00.307Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/e2ccf3_6a1808605de54e90889de4d0ecbbbe04~mv2.jpeg",
  }),
  kinoEvent({
    id: "static-kino-soudain-2026-09-03-20-00",
    title: "Soudain",
    slug: "soudain-2026-09-03-20-00",
    description:
      "Franzosisches Drama von Ryusuke Hamaguchi, franzosisch mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-09-03T18:00:00.000Z",
    end_date: "2026-09-03T21:30:00.142Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_0f89c21824e1418c9b1d5e368afea48b~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-die-odyssee-2026-09-04-20-00",
    title: "Die Odyssee",
    slug: "die-odyssee-2026-09-04-20-00",
    description:
      "Abenteuerfilm von Christopher Nolan in deutscher Sprache.",
    category: "cinema",
    start_date: "2026-09-04T18:00:00.000Z",
    end_date: "2026-09-04T21:05:00.687Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_c163b8beb05340e19a59e79a49986294~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-das-gewisse-etwas-2026-09-05-17-00",
    title: "Das Gewisse Etwas",
    slug: "das-gewisse-etwas-2026-09-05-17-00",
    description:
      "Deutsche Komodie von Marc Rothemund.",
    category: "cinema",
    start_date: "2026-09-05T15:00:00.000Z",
    end_date: "2026-09-05T17:15:00.000Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_fc27555355ff40afa91e811b0a972bc1~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-die-odyssee-2026-09-05-20-00",
    title: "Die Odyssee",
    slug: "die-odyssee-2026-09-05-20-00",
    description:
      "Abenteuerfilm von Christopher Nolan in deutscher Sprache.",
    category: "cinema",
    start_date: "2026-09-05T18:00:00.000Z",
    end_date: "2026-09-05T21:05:00.687Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_c163b8beb05340e19a59e79a49986294~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-backrooms-2026-09-06-00-01",
    title: "Backrooms",
    slug: "backrooms-2026-09-06-00-01",
    source_slug: "backrooms",
    description:
      "Allianz Tag des Kinos: Horrorfilm in deutscher Sprache, empfohlen ab 16 Jahren.",
    category: "cinema",
    start_date: "2026-09-05T22:01:00.000Z",
    end_date: "2026-09-05T23:21:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_a7e756b6a8c3418a9bd57826f8ebd151~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-germaine-acogny-2026-09-06-07-00",
    title: "Germaine Acogny - Die Essenz des Tanzes",
    slug: "germaine-acogny-die-essenz-des-tanzes-2026-09-06-07-00",
    source_slug: "germaine-acogny-die-essenz-des-tanzes",
    description:
      "Allianz Tag des Kinos: Dokumentarfilm uber Tanzerin und Choreografin Germaine Acogny.",
    category: "cinema",
    start_date: "2026-09-06T05:00:00.000Z",
    end_date: "2026-09-06T06:45:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_c12db4c0dd0e4936b637b0d576d9211c~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-a-bout-de-souffle-2026-09-06-11-00",
    title: "A bout de souffle (Re-Release)",
    slug: "a-bout-de-souffle-re-release-2026-09-06-11-00",
    source_slug: "a-bout-de-souffle-re-release",
    description:
      "Allianz Tag des Kinos: Re-Release von Jean-Luc Godards Klassiker.",
    category: "cinema",
    start_date: "2026-09-06T09:00:00.000Z",
    end_date: "2026-09-06T10:20:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_64d4e67ebc9e405c8f699f2ebdae9fd8~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-akiko-2026-09-06-14-00",
    title: "Akiko - der fliegende Affe",
    slug: "akiko-der-fliegende-affe-2026-09-06-14-00",
    source_slug: "akiko-der-fliegende-affe",
    description:
      "Allianz Tag des Kinos: Familienfilm in deutscher Sprache, empfohlen ab 6 Jahren.",
    category: "cinema",
    start_date: "2026-09-06T12:00:00.000Z",
    end_date: "2026-09-06T13:20:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_4204a3d7f7994dcc98b67a0a301125cd~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-unisono-2026-09-06-17-00",
    title: "Unisono - Von der Liebe zur Musik",
    slug: "unisono-von-der-liebe-zur-musik-2026-09-06-17-00",
    source_slug: "unisono-von-der-liebe-zur-musik",
    description:
      "Allianz Tag des Kinos: Schweizer Dokumentarfilm uber Musik.",
    category: "cinema",
    start_date: "2026-09-06T15:00:00.000Z",
    end_date: "2026-09-06T16:20:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_f7209e86fd174ba282fec71868de9e8d~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-coutures-2026-09-06-20-00",
    title: "Coutures",
    slug: "coutures-2026-09-06-20-00",
    source_slug: "coutures",
    description:
      "Allianz Tag des Kinos: Drama in englischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-09-06T18:00:00.000Z",
    end_date: "2026-09-06T19:20:00.366Z",
    price: KINO_ALLIANZ_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_205494e3609342c79b54ff6a922538aa~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-soudain-2026-09-07-20-00",
    title: "Soudain",
    slug: "soudain-2026-09-07-20-00",
    description:
      "Franzosisches Drama von Ryusuke Hamaguchi, franzosisch mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-09-07T18:00:00.000Z",
    end_date: "2026-09-07T21:30:00.142Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_0f89c21824e1418c9b1d5e368afea48b~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-coutures-2026-09-10-20-00",
    title: "Coutures",
    slug: "coutures-2026-09-10-20-00",
    description:
      "Drama in englischer Sprache mit deutschen Untertiteln.",
    category: "cinema",
    start_date: "2026-09-10T18:00:00.000Z",
    end_date: "2026-09-10T20:00:00.152Z",
    price: KINO_STANDARD_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_53882f4c88bb4532978b24388f048bdf~mv2.jpg",
  }),
  kinoEvent({
    id: "static-kino-acoustic-duo-tada-2026-10-09",
    title: "Acoustic Duo «TaDa»",
    slug: "acoustic-duo-tada-2026-10-09",
    source_slug: "acoustic-duo-tada",
    description:
      "Zwei Gitarren, zwei Stimmen und Songs der letzten 60 Jahre, mit Barbetrieb ab 19:00 Uhr.",
    category: "music",
    start_date: "2026-10-09T18:00:00.000Z",
    end_date: "2026-10-09T20:00:00.992Z",
    price: KINO_STAGE_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_d30093ee50ed42949bdde42e4b40f388~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-ich-bin-ich-2026-10-20",
    title: "Ich bin Ich",
    slug: "ich-bin-ich-2026-10-20",
    source_slug: "ich-bin-ich",
    description:
      "Dokumentarfilm zum Thema Selbstbestimmung statt Stigmatisierung, anschliessend Gesprach/Diskussion.",
    category: "cinema",
    start_date: "2026-10-20T17:00:00.000Z",
    end_date: "2026-10-20T18:30:00.171Z",
    price: KINO_SPECIAL_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_ab09333c2d8c45ca8a1bf5c74751790b~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-einzig-und-dr-andr-2026-11-13",
    title: "Einzig und dr Andr",
    slug: "einzig-und-dr-andr-2026-11-13",
    source_slug: "einzig-und-dr-andr",
    description:
      "Lieder und Geschichten aus der Provinz mit Livio Baldelli, Benno Muheim und Matteo Schenardi.",
    category: "music",
    start_date: "2026-11-13T19:00:00.000Z",
    end_date: "2026-11-13T21:00:00.487Z",
    price: KINO_STAGE_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_abc107e6fb0f4acd9ca4e188596ebd5b~mv2.png",
  }),
  kinoEvent({
    id: "static-kino-mediterranea-2026-12-01",
    title: "Mediterranea",
    slug: "mediterranea-2026-12-01",
    source_slug: "mediterranea",
    description:
      "Filmabend zum Thema Rassismus und psychische Erkrankung, anschliessend Gesprach/Diskussion.",
    category: "cinema",
    start_date: "2026-12-01T18:00:00.000Z",
    end_date: "2026-12-01T20:15:00.171Z",
    price: KINO_SPECIAL_PRICE,
    image_url:
      "https://static.wixstatic.com/media/6c5a42_11a0da445c78444682e4b0a1f6f25b60~mv2.png",
  }),
];

export const STATIC_CURATED_EVENTS: Event[] = [
  ...KINO_CURATED_EVENTS,
  event({
    id: "407dfa78-0d01-47f5-9b58-a35efd2cbb7f",
    organization_slug: GEMEINDE_MEIRINGEN_SLUG,
    title: "Samstag-Markt auf dem Casinoplatz",
    slug: "samstag-markt-casinoplatz-2026-08-15",
    description:
      "Traditioneller Markt mit regionalen Produkten, Bistro, Hot-Dog und Chäsbrätel im Zentrum von Meiringen.",
    category: "market",
    start_date: "2026-08-15T06:00:00.000Z",
    end_date: "2026-08-15T10:00:00.000Z",
    location_name: "Casinoplatz Meiringen",
    address: "3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-8/",
    image_url: MARKET_IMAGE_15,
  }),
  event({
    id: "ecffc7c8-c7f2-41ce-94ef-9bf2f28fcd84",
    title: "Bach-Orgelkonzert in Meiringen mit Prof. Freitag",
    slug: "bach-orgelkonzert-meiringen-prof-freitag-2026-08-21",
    description:
      "Bach-Tour 26 mit Prof. Helmut Freitag an der Rieger-Orgel der reformierten Michaelskirche.",
    category: "music",
    start_date: "2026-08-21T17:00:00.000Z",
    end_date: "2026-08-21T18:15:00.000Z",
    location_name: "Evang.-ref. Michaelskirche",
    address: "Bei der Kirche, 3860 Meiringen",
    price: "Eintritt frei, Kollekte",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/bachorgelkonzert-in-meiringen-mit-prof-freitag/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/7/d5/9f/7d59fb227238303206c20605228c88f59be89161_931418001.jpg",
  }),
  event({
    id: "c4558d9e-6f7e-469b-a463-cc99833ad0f7",
    organization_slug: GEMEINDE_MEIRINGEN_SLUG,
    title: "Samstag-Markt auf dem Casinoplatz",
    slug: "samstag-markt-casinoplatz-2026-08-22",
    description:
      "Traditioneller Markt mit regionalen Produkten und Bistro im Zentrum von Meiringen.",
    category: "market",
    start_date: "2026-08-22T06:00:00.000Z",
    end_date: "2026-08-22T10:00:00.000Z",
    location_name: "Casinoplatz Meiringen",
    address: "3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-9/",
    image_url: MARKET_IMAGE_22,
  }),
  event({
    id: "0ebb3e31-b631-4c0f-a984-1684c6aac527",
    title: "Migros Hiking Sounds - Meiringen-Hasliberg",
    slug: "migros-hiking-sounds-meiringen-hasliberg-2026-08-29",
    description:
      "Musik- und Wanderfestival auf dem Hasliberg mit Vanessa Mai und Dodo.",
    category: "music",
    start_date: "2026-08-29T07:00:00.000Z",
    end_date: null,
    location_name: "Meiringen-Hasliberg",
    address: "6084 Hasliberg Wasserwendi",
    price: null,
    language: "de",
    is_recurring: false,
    source_url: "https://en.panorama-hasliberg.ch/175/migros-hiking-sounds",
    image_url:
      "https://meiringen-hasliberg.ch/cmsfiles/posts/images/7f9403a7-d54b-407a-befc-9a2f15c1ecbd_rw_1920_img2_thmb1.jpg",
  }),
  event({
    id: "13f3a4a7-b996-4d61-b5dc-2bd6376ff40e",
    title: "Führungen Michaelskirche, Ausgrabungen und Turm",
    slug: "fuehrungen-michaelskirche-2026-08-29",
    description:
      "Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.",
    category: "culture",
    start_date: "2026-08-29T14:30:00.000Z",
    end_date: "2026-08-29T16:00:00.000Z",
    location_name: "Michaelskirche Meiringen",
    address: "Bei der Kirche 2, 3860 Meiringen",
    price: "Freiwillige Kollekte",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/",
    image_url: MICHAELSKIRCHE_IMAGE,
  }),
  event({
    id: "3edbd67b-919c-4b7f-aed4-e39083cffd31",
    title: "Migros Hiking Sounds - Meiringen-Hasliberg",
    slug: "migros-hiking-sounds-meiringen-hasliberg-2026-08-30",
    description:
      "Musik- und Wanderfestival auf dem Hasliberg mit Stubete Gäng, Halunke und Heimatliebi.",
    category: "music",
    start_date: "2026-08-30T07:00:00.000Z",
    end_date: null,
    location_name: "Meiringen-Hasliberg",
    address: "6084 Hasliberg Wasserwendi",
    price: null,
    language: "de",
    is_recurring: false,
    source_url: "https://en.panorama-hasliberg.ch/175/migros-hiking-sounds",
    image_url:
      "https://meiringen-hasliberg.ch/cmsfiles/posts/images/7f9403a7-d54b-407a-befc-9a2f15c1ecbd_rw_1920_img2_thmb1.jpg",
  }),
  event({
    id: "bf6ac0ec-baca-4e53-addd-ef752b6295fb",
    title: "Weindegustation auf der Tällihütte",
    slug: "weindegustation-taellihuette-2026-09-03",
    description:
      "Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.",
    category: "social",
    start_date: "2026-09-03T16:00:00.000Z",
    end_date: "2026-09-03T19:30:00.000Z",
    location_name: "Berggasthaus Tälli",
    address: "Birchlaui 222, 3863 Gadmen",
    price: "CHF 68",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/",
    image_url: WEIN_IMAGE,
  }),
  event({
    id: "11b28931-3cb7-4e53-89d4-c987786c52c9",
    organization_slug: GEMEINDE_MEIRINGEN_SLUG,
    title: "Samstag-Markt auf dem Casinoplatz",
    slug: "samstag-markt-casinoplatz-2026-09-05",
    description:
      "Traditioneller Markt mit regionalen Produkten, Bistro und Live-Musik im Zentrum von Meiringen.",
    category: "market",
    start_date: "2026-09-05T06:00:00.000Z",
    end_date: "2026-09-05T10:00:00.000Z",
    location_name: "Casinoplatz Meiringen",
    address: "3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-11/",
    image_url: MARKET_IMAGE_SEP_5,
  }),
  event({
    id: "d5e28566-4cd7-4940-ae8f-97484e3843f3",
    title: "Sonnenaufgangs-Frühstück",
    slug: "sonnenaufgangs-fruehstueck-alpen-tower-2026-09-06",
    description:
      "Frühe Extrafahrt und Frühstücksbuffet auf dem Alpen tower zum Sonnenaufgang.",
    category: "nature",
    start_date: "2026-09-06T05:00:00.000Z",
    end_date: "2026-09-06T07:00:00.000Z",
    location_name: "Alpen tower",
    address: "Meiringen-Hasliberg",
    price: null,
    language: "de",
    is_recurring: true,
    source_url: "https://meiringen-hasliberg.ch/177/sonnenaufgangs-fruhstuck",
    image_url:
      "https://meiringen-hasliberg.ch/cmsfiles/posts/images/_b199267_by.davidbirri_img2_thmb1.jpg",
  }),
  event({
    id: "e50565fe-1dc4-4e78-b4f4-dcceda0a30ae",
    organization_slug: KINO_ORGANIZATION_SLUG,
    title: "Allianz Tag des Kinos",
    slug: "allianz-tag-des-kinos-2026-09-06",
    description:
      "Kinotag mit aktuellen Filmen zum Spezialpreis im Kino Meiringen.",
    category: "cinema",
    start_date: "2026-09-06T10:00:00.000Z",
    end_date: null,
    location_name: "Kino Meiringen",
    address: "Kirchgasse 7, 3860 Meiringen",
    price: "CHF 7",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/allianz-tag-des-kinos/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/4/e9/3b/4e93b340394fcdede256312d61096f35af6d660c_944124654.jpg",
  }),
  event({
    id: "b30516fa-0db3-452b-bf64-fac6f1bc6dc4",
    title: "Führungen Michaelskirche, Ausgrabungen und Turm",
    slug: "fuehrungen-michaelskirche-2026-09-09",
    description:
      "Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.",
    category: "culture",
    start_date: "2026-09-09T14:30:00.000Z",
    end_date: "2026-09-09T16:00:00.000Z",
    location_name: "Michaelskirche Meiringen",
    address: "Bei der Kirche 2, 3860 Meiringen",
    price: "Freiwillige Kollekte",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/",
    image_url: MICHAELSKIRCHE_IMAGE,
  }),
  event({
    id: "bf3dfff4-d746-468c-8a86-4338f841fdef",
    title: "Weindegustation auf der Tällihütte",
    slug: "weindegustation-taellihuette-2026-09-10",
    description:
      "Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.",
    category: "social",
    start_date: "2026-09-10T16:00:00.000Z",
    end_date: "2026-09-10T19:30:00.000Z",
    location_name: "Berggasthaus Tälli",
    address: "Birchlaui 222, 3863 Gadmen",
    price: "CHF 68",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/",
    image_url: WEIN_IMAGE,
  }),
  event({
    id: "9b78ffeb-92a9-4a87-a1ed-338fa3e70fd5",
    organization_slug: KINO_ORGANIZATION_SLUG,
    title: "Dominik Muheim Soft Ice",
    slug: "dominik-muheim-soft-ice-2026-09-11",
    description:
      "Satirisches Bühnenprogramm von Dominik Muheim im Kino Meiringen.",
    category: "culture",
    start_date: "2026-09-11T18:00:00.000Z",
    end_date: "2026-09-11T20:00:00.000Z",
    location_name: "Kino Meiringen",
    address: "Kirchgasse 7, 3860 Meiringen",
    price: "CHF 30 / 20",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/dominik-muheim-soft-ice-2/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/2/d7/39/2d7393526e62d17861b7438f3658bf47af885ac7_908774477.jpg",
  }),
  event({
    id: "aee2bd0b-1dec-4a67-b07f-6ab68aac7418",
    title: "Chästeilet Mägisalp",
    slug: "chaesteilet-maegisalp-2026-09-12",
    description:
      "Traditionelles Volksfest zum Abschluss des Alpsommers auf der Mägisalp.",
    category: "tradition",
    start_date: "2026-09-12T09:00:00.000Z",
    end_date: null,
    location_name: "Mägisalp",
    address: "6086 Hasliberg",
    price: null,
    language: "de",
    is_recurring: false,
    source_url: "https://en.meiringen-hasliberg.ch/176/chasteilet-magisalp",
    image_url:
      "https://en.meiringen-hasliberg.ch/176/cmsfiles/posts/images/815_7254_bydavidbirri_img2_thmb1.jpg",
  }),
  event({
    id: "d533fe15-5e8a-45d5-a9fa-00cce6e4bcdb",
    title: "Weindegustation auf der Tällihütte",
    slug: "weindegustation-taellihuette-2026-09-18",
    description:
      "Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.",
    category: "social",
    start_date: "2026-09-18T16:00:00.000Z",
    end_date: "2026-09-18T19:30:00.000Z",
    location_name: "Berggasthaus Tälli",
    address: "Birchlaui 222, 3863 Gadmen",
    price: "CHF 68",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/",
    image_url: WEIN_IMAGE,
  }),
  event({
    id: "bdb962fe-7298-45fa-bb0c-f41cbd3adef0",
    organization_slug: GEMEINDE_MEIRINGEN_SLUG,
    title: "Samstag-Markt auf dem Casinoplatz",
    slug: "samstag-markt-casinoplatz-2026-09-19",
    description:
      "Traditioneller Markt mit regionalen Produkten, Bistro und Live-Musik im Zentrum von Meiringen.",
    category: "market",
    start_date: "2026-09-19T06:00:00.000Z",
    end_date: "2026-09-19T10:00:00.000Z",
    location_name: "Casinoplatz Meiringen",
    address: "3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-13/",
    image_url: MARKET_IMAGE_SEP_19,
  }),
  event({
    id: "fe6f3dc8-8bdd-4db0-9fe8-3cd9300f3490",
    organization_slug: SV_MEIRINGEN_SLUG,
    title: "Swisscom Football Camp Meiringen",
    slug: "swisscom-football-camp-meiringen-2026-09-21",
    description:
      "Tagescamp von MS Sports und SV Meiringen mit Training und Rahmenprogramm für Kinder.",
    category: "sport",
    start_date: "2026-09-21T07:30:00.000Z",
    end_date: "2026-09-25T14:00:00.000Z",
    location_name: "Fussballplatz Wiltschen",
    address: "Brünigstrasse 95, 3860 Meiringen",
    price: "CHF 315",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/swisscom-football-camp-meiringen/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/uploaded/2/c1/e3/2c1e3aa1bcd914086df8b1089056b2fa0f4958f2.png",
  }),
  event({
    id: "72037e1c-a86c-48bb-a8b9-099daf153956",
    title: "Weindegustation auf der Tällihütte",
    slug: "weindegustation-taellihuette-2026-09-25",
    description:
      "Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.",
    category: "social",
    start_date: "2026-09-25T16:00:00.000Z",
    end_date: "2026-09-25T19:30:00.000Z",
    location_name: "Berggasthaus Tälli",
    address: "Birchlaui 222, 3863 Gadmen",
    price: "CHF 68",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/",
    image_url: WEIN_IMAGE,
  }),
  event({
    id: "f2416fa8-60e4-470a-9aab-81c4f0e83319",
    title: "Führungen Michaelskirche, Ausgrabungen und Turm",
    slug: "fuehrungen-michaelskirche-2026-09-26",
    description:
      "Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.",
    category: "culture",
    start_date: "2026-09-26T14:30:00.000Z",
    end_date: "2026-09-26T16:00:00.000Z",
    location_name: "Michaelskirche Meiringen",
    address: "Bei der Kirche 2, 3860 Meiringen",
    price: "Freiwillige Kollekte",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/",
    image_url: MICHAELSKIRCHE_IMAGE,
  }),
  event({
    id: "8d8b8be7-a301-4a36-8f1a-80ebfbf78a81",
    title: "Linedance & Alpenzauber Vol. II",
    slug: "linedance-alpenzauber-vol-ii-2026-09-26",
    description:
      "Line-Dance-Workshops, gemeinsames Essen und Tanzabend im Hotel Restaurant Terrasse.",
    category: "social",
    start_date: "2026-09-26T07:00:00.000Z",
    end_date: "2026-09-26T21:00:00.000Z",
    location_name: "Hotel Restaurant Terrasse",
    address: "Sustenstrasse 55, 3863 Gadmen",
    price: "CHF 120 ganzer Tag",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/linedance-alpenzauber-vol-ii/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/f/70/a7/f70a725f9513ec066d253ba282d613d78a2aacb0_942489065.jpg",
  }),
  event({
    id: "a149974c-6ece-461f-b49a-cbae92786da5",
    title: "Erinnerungsanlass «80 Jahre Dakota»",
    slug: "erinnerungsanlass-80-jahre-dakota-2026-10-10",
    description:
      "Familienanlass zum Jahrestag der Dakota-Rettung mit Ausstellung, historischen Fahrzeugen und Vorträgen.",
    category: "tradition",
    start_date: "2026-10-10T08:00:00.000Z",
    end_date: "2026-10-11T14:00:00.000Z",
    location_name: "Flugplatz Unterbach",
    address: "3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/erinnerungsanlass-80-jahre-dakota/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/a/01/03/a0103dd2b423e5bcb1a0a4d8744b004f29a2ca2d_935917208.jpg",
  }),
  event({
    id: "c933f5fa-a521-4ee6-8713-4c1d8e475535",
    title: "Führungen Michaelskirche, Ausgrabungen und Turm",
    slug: "fuehrungen-michaelskirche-2026-10-24",
    description:
      "Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.",
    category: "culture",
    start_date: "2026-10-24T14:30:00.000Z",
    end_date: "2026-10-24T16:00:00.000Z",
    location_name: "Michaelskirche Meiringen",
    address: "Bei der Kirche 2, 3860 Meiringen",
    price: "Freiwillige Kollekte",
    language: "de",
    is_recurring: true,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/",
    image_url: MICHAELSKIRCHE_IMAGE,
  }),
  event({
    id: "1243147e-8f5c-4cc9-b538-fa952c63ea94",
    title: "Repair Café Haslital",
    slug: "repair-cafe-haslital-2026-10-24",
    description:
      "Plattform Haslital organisiert Reparaturen für kaputte Alltagsgegenstände mit Freiwilligen.",
    category: "social",
    start_date: "2026-10-24T07:00:00.000Z",
    end_date: "2026-10-24T12:00:00.000Z",
    location_name: "Evang.-ref. Kirchgemeindehaus Meiringen",
    address: "Kirchgasse 19, 3860 Meiringen",
    price: null,
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/repair-cafe-haslital/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/d2/4e/dd24e178a71070714766a804f3778892249284da_804404305.png",
  }),
  event({
    id: "f109e598-0414-4846-b673-004ea7a0ce71",
    organization_slug: MUSIKGESELLSCHAFT_MEIRINGEN_SLUG,
    title: "Konzert in den Advent der Musikgesellschaft Meiringen",
    slug: "konzert-in-den-advent-musikgesellschaft-meiringen-2026-11-29",
    description:
      "Adventskonzert der Jugendmusik Meiringen und Musikgesellschaft Meiringen in der Michaelskirche.",
    category: "music",
    start_date: "2026-11-29T16:00:00.000Z",
    end_date: "2026-11-29T17:00:00.000Z",
    location_name: "Evang.-ref. Michaelskirche",
    address: "Kirchgasse 19, 3860 Meiringen",
    price: "Eintritt frei, Kollekte",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/konzert-in-den-advent-der-musikgesellschaft-meiringen/",
    image_url:
      "https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/4/63/14/46314eef132e843389154937b06f8dde018136ed_836901922.png",
  }),
  event({
    id: "5b8bcee6-e434-4669-98ca-d2e8007cc36c",
    organization_slug: KINO_ORGANIZATION_SLUG,
    title: "Simon Enzler zmetztinne",
    slug: "simon-enzler-zmetztinne-2026-12-10",
    description:
      "Kabarettabend mit Simon Enzler im Kino Meiringen.",
    category: "culture",
    start_date: "2026-12-10T19:00:00.000Z",
    end_date: "2026-12-10T21:00:00.000Z",
    location_name: "Kino Meiringen",
    address: "Kirchgasse 7, 3860 Meiringen",
    price: "CHF 30 / 20",
    language: "de",
    is_recurring: false,
    source_url:
      "https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/simon-enzler-zmetztinne-1/",
    image_url: null,
  }),
];

export function getStaticCuratedEvents(): Event[] {
  return STATIC_CURATED_EVENTS;
}
