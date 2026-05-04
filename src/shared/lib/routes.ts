export const routes = {
  signIn: "/sign-in",
  unauthorized: "/unauthorized",
  workspace: (slug: string) => `/w/${slug}`,
  workspaceLists: (slug: string) => `/w/${slug}/lists`,
  newList: (slug: string) => `/w/${slug}/lists/new`,
  list: (slug: string, listId: string) => `/w/${slug}/lists/${listId}`,
  listSettings: (slug: string, listId: string) => `/w/${slug}/lists/${listId}/settings`,
  listShare: (slug: string, listId: string) => `/w/${slug}/lists/${listId}/share`,
};
