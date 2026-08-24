import Image from 'next/image';
import { ApiError, apiGet } from '@/lib/api';
import { formatDateRange, toFileUrl } from '@/lib/format';
import type { Post, Sermon } from '@/lib/types';
import { CHURCH_LOCATION, NAVER_MAP_LINK, SITE } from '@/lib/site';
import { YouTubeFacade } from '@/components/media/YouTubeFacade';
import { InteractiveChurchMap } from '@/components/map/InteractiveChurchMap';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import {
  About,
  AboutCopy,
  AboutEffect,
  Button,
  ButtonArrow,
  Contact,
  ContactActions,
  ContactCopy,
  ContactIcon,
  ContactVisual,
  DateLine,
  Empty,
  Eyebrow,
  Feature,
  FeatureDetail,
  FeatureFrame,
  FeatureHeading,
  FeatureMeta,
  FeatureText,
  Gallery,
  GalleryBackground,
  GalleryHeading,
  GrowArtwork,
  Hero,
  HeroContent,
  HeroLead,
  HeroShade,
  HeroTitle,
  HeroUnderGlow,
  InteractiveMap,
  Message,
  MessageEmpty,
  MessageEmptyCopy,
  Page,
  SectionIntro,
  SectionTitle,
  Social,
  SocialLink,
  SrOnlyText,
  Story,
  StoryCell,
  StoryGrid,
  StoryPlaceholder,
  Worship,
  WorshipCopy,
  WorshipShade,
} from './home.styled';

function formatHomeDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(value))
    .toUpperCase();
}

export const dynamic = 'force-dynamic';

type Story = { title: string; date: string; href: string; image: string | null };

async function getHomepageGalleryStories(): Promise<Story[]> {
  try {
    const posts = await apiGet<Post[]>('/posts/latest/gallery', { revalidate: 0 });
    return posts
      .map<Story>((post) => {
        const image =
          post.thumbnailUrl ??
          post.attachments?.[0]?.fileUrl;
        return {
          title: post.title,
          date: formatDateRange(post.startDate, post.endDate),
          href: `/share/gallery/${post.id}`,
          image: image ? toFileUrl(image) : null,
        };
      })
      .slice(0, 4);
  } catch (error) {
    if (error instanceof ApiError && [404, 502, 503, 504].includes(error.status)) return [];
    throw error;
  }
}

function ContactIconImg({ kind }: { kind: 'calendar' | 'location' | 'map' | 'instagram' | 'youtube' }) {
  return <ContactIcon src={`/images/icons/contact-${kind}.svg`} alt="" width={24} height={24} />;
}

export default async function HomePage() {
  const [latestSermons, latestGallery] = await Promise.all([
    apiGet<Sermon[]>('/sermons/latest', { revalidate: 0 }).catch(() => [] as Sermon[]),
    getHomepageGalleryStories(),
  ]);
  const featured = latestSermons[0] ?? null;
  const stories = latestGallery;
  return (
    <Page>
      <Hero aria-labelledby="home-title">
        <HeroBackgroundVideo />
        <HeroShade data-zone="home-hero-blue-overlay" />
        <HeroContent>
          <HeroTitle id="home-title">우리는<span>부름 받았습니다</span></HeroTitle>
          <HeroLead>부름 받은 자들의 공동체.<br />Called to serve. Built to last.</HeroLead>
          <Button href="/about">우리 공동체 알아보기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
        </HeroContent>
        <HeroUnderGlow aria-hidden="true" data-zone="home-hero-under-glow" />
      </Hero>

      <About aria-labelledby="about-title">
        <AboutEffect aria-hidden="true" />
        <GrowArtwork aria-hidden="true" />
        <SrOnlyText>WE GROW TOGETHER</SrOnlyText>
        <AboutCopy delay={100}>
          <Eyebrow>ABOUT US</Eyebrow>
          <SectionTitle id="about-title">우리는<br />응답합니다</SectionTitle>
          <p data-zone="home-about-copy">
            <span>KALEO YOUTH 는 수도교회 청소년부 공동체입니다.</span>
            <span><strong>“칼레오(καλέω)”</strong>는 헬라어로 “부른다”는 뜻으로,</span>
            <span>하나님의 부르심 앞에 응답하는 청소년들의 모임입니다.</span>
          </p>
          <blockquote data-zone="home-about-quote">
            <span>“내가 너를 지명하여 불렀나니 너는 내 것이라”</span>
            <span>— 이사야 43:1</span>
          </blockquote>
        </AboutCopy>
      </About>

      <Message aria-labelledby="message-title" data-zone="home-message-section">
        <SectionIntro>
          <Eyebrow>MESSAGE</Eyebrow>
          <SectionTitle id="message-title">하나님의<br />말씀을 듣습니다</SectionTitle>
          <p>하나님의 말씀을 듣고, 삶으로 살아내는 우리입니다.</p>
        </SectionIntro>
        {featured ? (
          <Feature delay={120} data-zone="home-message-featured">
            {featured.youtubeVideoId ? (
              <FeatureFrame>
                <YouTubeFacade
                  authoredPoster={Boolean(featured.posterUrl ?? featured.thumbnailUrl)}
                  posterSrc={toFileUrl(featured.posterUrl ?? featured.thumbnailUrl) || undefined}
                  videoId={featured.youtubeVideoId}
                  title="KALEO YOUTH 예배 영상"
                />
              </FeatureFrame>
            ) : null}
            <FeatureMeta>
              <FeatureText>
                <FeatureHeading>
                  <DateLine>
                    {formatHomeDate(featured.publishedAt)} · SUNDAY WORSHIP
                  </DateLine>
                  <h3>{featured.title}</h3>
                </FeatureHeading>
                <FeatureDetail data-zone="home-message-detail">
                  <p>{featured.bibleReference ?? ''}</p>
                  <p>{featured.preacherName}</p>
                </FeatureDetail>
              </FeatureText>
              <Button href={`/sermons/${featured.id}`}>더 많은 영상 보기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
            </FeatureMeta>
          </Feature>
        ) : (
          <MessageEmpty delay={120} data-zone="home-message-empty">
            <span>MESSAGE ARCHIVE</span>
            <MessageEmptyCopy>
              <p>이번 주의 말씀은 준비 중입니다</p>
              <h3>다음 말씀을 기다리고 있어요</h3>
              <p>지난 말씀을 다시 만나보세요.<br />예배의 은혜를 일상에서도 이어갈 수 있습니다.</p>
            </MessageEmptyCopy>
            <Button href="/sermons">지난 말씀 둘러보기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
          </MessageEmpty>
        )}
      </Message>

      <Worship aria-labelledby="worship-title">
        <Image
          src="/images/exact/image-98-3166-cal.png"
          alt="J-Teen 찬양팀 예배 모습"
          width={1220}
          height={620}
          sizes="(max-width: 1023px) 100vw, 1220px"
        />
        <WorshipShade />
        <WorshipCopy>
          <Eyebrow>J-TEEN WORSHIP</Eyebrow>
          <SectionTitle id="worship-title">함께 찬양합니다</SectionTitle>
          <p data-zone="home-worship-copy">찬양은 우리의 고백이자, 하나님을 만나는 가장 가까운 자리입니다.</p>
          <Button href="/jteen">이번주 콘티 보기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
        </WorshipCopy>
      </Worship>

      <Gallery aria-labelledby="gallery-title">
        <GalleryBackground
          src="/images/sections/gallery-bg.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
        />
        <GalleryHeading>
          <div><Eyebrow>GALLERY</Eyebrow><SectionTitle id="gallery-title">우리의 이야기를<br />담았습니다</SectionTitle></div>
          <Button href="/share/gallery">갤러리 보기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
        </GalleryHeading>
        {stories.length > 0 ? (
        <StoryGrid>{stories.map((story, index) => (
            <StoryCell key={`${story.href}-${story.title}`} delay={index * 70}>
              <Story href={story.href} aria-label={`${story.title} ${story.date}`}>
                {story.image ? (
                  <Image
                    src={story.image}
                    alt=""
                    width={450}
                    height={500}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 450px"
                    loading="eager"
                    unoptimized
                  />
                ) : (
                  <StoryPlaceholder aria-hidden="true" />
                )}
                <span><strong>{story.title}</strong><small>{story.date}</small></span>
              </Story>
            </StoryCell>
          ))}</StoryGrid>
        ) : <Empty>새로운 이야기를 준비하고 있습니다.</Empty>}
      </Gallery>

      <Contact aria-labelledby="contact-title">
        <ContactCopy>
          <Eyebrow>CONTACT</Eyebrow>
          <SectionTitle id="contact-title">함께하고 싶으신가요?</SectionTitle>
          <dl>
            <div><dt><span aria-hidden="true"><ContactIconImg kind="calendar" /></span> 예배 시간</dt><dd>매주 일요일 오전 10:00</dd></div>
            <div><dt><span aria-hidden="true"><ContactIconImg kind="location" /></span> 예배 장소</dt><dd>수도교회 소예배실</dd></div>
            <div><dt><span aria-hidden="true"><ContactIconImg kind="map" /></span> 교회 주소</dt><dd>{SITE.contact.address}</dd></div>
          </dl>
          <Social>
            <h3>SNS</h3>
            <SocialLink href={SITE.social.instagram} target="_blank" rel="noreferrer noopener">
              <ContactIconImg kind="instagram" /> 수도교회 청소년부
            </SocialLink>
            <SocialLink href={SITE.social.youtube} target="_blank" rel="noreferrer noopener">
              <ContactIconImg kind="youtube" /> 수도침례교회 청소년부
            </SocialLink>
          </Social>
          <ContactActions>
            <Button href={SITE.social.instagram} target="_blank" rel="noreferrer noopener">인스타그램 바로가기 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
            <Button href={NAVER_MAP_LINK} target="_blank" rel="noreferrer noopener">네이버 지도 <ButtonArrow src="/images/icons/arrow-right.svg" alt="" width={24} height={24} /></Button>
          </ContactActions>
        </ContactCopy>
        <ContactVisual delay={120}>
          <InteractiveMap
            data-zone="home-interactive-map"
            data-latitude={CHURCH_LOCATION.latitude}
            data-longitude={CHURCH_LOCATION.longitude}
            aria-label="수도교회 위치 지도"
          >
            <InteractiveChurchMap />
          </InteractiveMap>
        </ContactVisual>
      </Contact>
    </Page>
  );
}
