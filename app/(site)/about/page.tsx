import type { Metadata } from 'next';
import Image from 'next/image';
import { Fragment } from 'react';
import { Reveal } from '@/components/motion/Motion';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { apiGet } from '@/lib/api';
import { toFileUrl } from '@/lib/format';
import type { AboutPage, AboutValue, WorshipTeam } from '@/lib/types';
import {
  Closing,
  ClosingCopy,
  ClosingDivider,
  ClosingMedia,
  Eyebrow,
  Intro,
  IntroCopy,
  Leader,
  LeaderPortrait,
  Member,
  MemberGrid,
  MemberIcon,
  MemberPortrait,
  Page,
  Team,
  ValueDivider,
  ValueIcon,
  Values,
} from './about.styled';

async function loadAbout(): Promise<AboutPage> {
  return apiGet<AboutPage>('/about', { revalidate: 0 });
}

export async function generateMetadata(): Promise<Metadata> {
  const about = await loadAbout();
  return { title: about.metaTitle, description: about.metaDescription };
}

function ValueGlyph({ icon }: { readonly icon: AboutValue['icon'] }) {
  if (icon === 'cross') {
    return <svg viewBox="0 0 56 64"><path d="M23 3h10v17h15v10H33v31H23V30H8V20h15Z" /></svg>;
  }

  if (icon === 'bible') {
    return <svg viewBox="0 0 60 64"><path d="M9 5h38a5 5 0 0 1 5 5v46H14a6 6 0 0 1-6-6V6m7 0v49m18-37v24m-9-15h18" /></svg>;
  }

  return <svg viewBox="0 0 72 56"><path d="M24 27a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm24 0a11 11 0 1 0 0-22 11 11 0 0 0 0 22ZM4 52c1-13 8-20 20-20s19 7 20 20m-8 0c1-13 5-20 12-20 12 0 19 7 20 20" /></svg>;
}

function TeamIcon({ role }: { role: string }) {
  const icon = role === 'Electric Guitar'
    ? 'electric-guitar'
    : role === 'DRUMS'
      ? 'drums'
      : role === 'MAIN KEYBOARD'
        ? 'main-keyboard'
        : role === 'SECOND KEYBOARD'
          ? 'second-keyboard'
          : role === 'BASS'
            ? 'bass'
            : 'vocal';

  return <Image src={`/images/about/exact/icons-svg/${icon}.svg`} alt="" fill sizes="140px" unoptimized />;
}

export default async function AboutPage() {
  const [about, team] = await Promise.all([
    loadAbout(),
    apiGet<WorshipTeam>('/worship-teams/primary', { revalidate: 0 }).catch(() => null),
  ]);
  const members = [...(team?.members ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const leaderLines = about.leaderBody.split('\n');

  return (
    <Page>
      <Intro aria-labelledby="about-heading">
        <IntroCopy>
          <Eyebrow>{about.introEyebrow}</Eyebrow>
          <h1 id="about-heading">{about.introTitle}</h1>
          <p><span>{about.introBody}</span></p>
        </IntroCopy>
        <Values>
          {about.values.map((value, index) => (
            <Fragment key={value.label}>
              <article>
                <ValueIcon aria-hidden="true"><ValueGlyph icon={value.icon} /></ValueIcon>
                <small>{value.label}</small>
                <h2>{value.title}</h2>
                <p>{value.body}</p>
              </article>
              {index < about.values.length - 1 ? <ValueDivider aria-hidden="true" /> : null}
            </Fragment>
          ))}
        </Values>
      </Intro>

      <Reveal>
        <Leader aria-labelledby="leader-title" data-zone="about-leader">
          <LeaderPortrait>
            {about.leaderPhotoUrl ? <Image src={toFileUrl(about.leaderPhotoUrl)} alt={about.leaderName} fill sizes="312px" /> : null}
          </LeaderPortrait>
          <div>
            <Eyebrow>{about.leaderEyebrow}</Eyebrow>
            <h2 id="leader-title"><span>{about.leaderName}</span> <small>{about.leaderRole}</small></h2>
            <blockquote>{leaderLines.map((line, index) => <Fragment key={`${index}-${line}`}>{line}{index < leaderLines.length - 1 ? <br /> : null}</Fragment>)}</blockquote>
          </div>
        </Leader>
      </Reveal>

      <Team aria-labelledby="team-title">
        <header>
          <Eyebrow data-zone="about-team-eyebrow">{about.teamEyebrow}</Eyebrow>
          <h2 id="team-title">{team?.name}</h2>
          <p data-zone="about-team-description">{team?.description}</p>
        </header>
        <MemberGrid>
          {members.map((member) => (
            <Member key={member.id} data-zone="about-member-card">
              <MemberPortrait
                $hasPhoto={Boolean(member.photoUrl)}
                aria-hidden="true"
                data-zone="about-member-portrait"
              >
                {member.photoUrl ? (
                  <Image
                    src={toFileUrl(member.photoUrl)}
                    alt=""
                    fill
                    sizes="215px"
                  />
                ) : null}
              </MemberPortrait>
              <MemberIcon aria-hidden="true"><TeamIcon role={member.part ?? ''} /></MemberIcon>
              <div>
                <small>{member.part}</small>
                <h3>{member.name}</h3>
                <p>{member.bio?.split('|').map((line) => <span key={line}>{line}</span>)}</p>
              </div>
            </Member>
          ))}
        </MemberGrid>
      </Team>

      <Closing aria-label={about.closingPhotoLabel}>
        <ClosingMedia aria-hidden="true">
          {about.closingPhotoUrl ? <Image src={toFileUrl(about.closingPhotoUrl)} alt="" fill sizes="(max-width: 1023px) 100vw, 1220px" /> : null}
        </ClosingMedia>
        <ClosingCopy>
          <p data-zone="about-closing-statement">{about.closingLines.map((line) => <span key={line}>{line}</span>)}</p>
          <ClosingDivider aria-label={about.closingLabel}>
            <span aria-hidden="true" />
            <strong>{about.closingLabel}</strong>
            <span aria-hidden="true" />
          </ClosingDivider>
        </ClosingCopy>
      </Closing>
      <PageUnderGlowClip $top={2827}>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
