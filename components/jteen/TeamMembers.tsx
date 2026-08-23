'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { toFileUrl } from '@/lib/format';
import type { WorshipTeamMember } from '@/lib/types';

const Grid = styled.ul`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

const Member = styled.li`
  text-align: center;
`;

const Portrait = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primaryTint};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;

  img {
    object-fit: cover;
  }

  span {
    font-size: 26px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Name = styled.strong`
  display: block;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.ink};
`;

const Part = styled.em`
  display: block;
  margin-top: 5px;
  font-style: normal;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.muted};
`;

export function TeamMembers({ members }: { members: WorshipTeamMember[] }) {
  return (
    <Grid>
      {members.map((member) => (
        <Member key={member.id}>
          <Portrait>
            {member.photoUrl ? (
              <Image
                src={toFileUrl(member.photoUrl)}
                alt={member.name}
                fill
                sizes="180px"
              />
            ) : (
              <span aria-hidden>{member.name.charAt(0)}</span>
            )}
          </Portrait>
          <Name>{member.name}</Name>
          {member.part ? <Part>{member.part}</Part> : null}
        </Member>
      ))}
    </Grid>
  );
}
