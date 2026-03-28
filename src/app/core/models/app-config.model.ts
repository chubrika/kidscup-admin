/** Shape of GET /config (public, whitelisted keys only). */
export type PublicAppConfig = {
  team_registration_enabled: boolean;
  maintenance_mode: boolean;
};
