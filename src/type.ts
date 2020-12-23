type Slug = {
  name: string;
  isRest: boolean;
};
export type Slugs = Slug[];

export type MetaData = {
  componentPath: string;
  urlPath: string;
  path: string;
  slugs?: Slugs;
  isLastOptional: boolean;
};
