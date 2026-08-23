'use client';

import styled from 'styled-components';

export const GalleryPage = styled.div`
  min-height: 100vh;
  color: var(--ky-ink);
  background: var(--ky-ground);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0 var(--ky-gutter) 56px;
  background: var(--ky-line);
  border: 1px solid var(--ky-line);

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
