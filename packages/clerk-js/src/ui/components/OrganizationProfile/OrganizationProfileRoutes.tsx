import { useOrganizationProfileContext } from '../../contexts';
import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { ExternalElementMounter } from '../../utils';
import { DeleteOrganizationPage, LeaveOrganizationPage } from './ActionConfirmationPage';
import { AddDomainPage } from './AddDomainPage';
import { InviteMembersPage } from './InviteMembersPage';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { RemoveDomainPage } from './RemoveDomainPage';
import { VerifiedDomainPage } from './VerifiedDomainPage';
import { VerifyDomainPage } from './VerifyDomainPage';

export const OrganizationProfileRoutes = (props: PropsOfComponent<typeof ProfileCardContent>) => {
  const { pages } = useOrganizationProfileContext();
  const isMembersPageRoot = pages.routes[0].id === 'members';
  const isSettingsPageRoot = pages.routes[0].id === 'settings';
  const isPredefinedPageRoot = isSettingsPageRoot || isMembersPageRoot;

  return (
    <ProfileCardContent contentRef={props.contentRef}>
      <Switch>
        {/* Custom Pages */}
        {pages.contents?.map((customPage, index) => (
          <Route
            index={!isPredefinedPageRoot && index === 0}
            path={!isPredefinedPageRoot && index === 0 ? undefined : customPage.url}
            key={`custom-page-${customPage.url}`}
          >
            <ExternalElementMounter
              mount={customPage.mount}
              unmount={customPage.unmount}
            />
          </Route>
        ))}
        <Route>
          <Route path={isSettingsPageRoot ? undefined : 'organization-settings'}>
            <Switch>
              <Route
                path='profile'
                flowStart
              >
                <ProfileSettingsPage />
              </Route>
              <Route
                path='domain'
                flowStart
              >
                <Switch>
                  <Route path=':id/verify'>
                    <VerifyDomainPage />
                  </Route>
                  <Route path=':id/remove'>
                    <RemoveDomainPage />
                  </Route>
                  <Route path=':id'>
                    <VerifiedDomainPage />
                  </Route>
                  <Route index>
                    <AddDomainPage />
                  </Route>
                </Switch>
              </Route>
              <Route
                path='leave'
                flowStart
              >
                <LeaveOrganizationPage />
              </Route>
              <Route
                path='delete'
                flowStart
              >
                <DeleteOrganizationPage />
              </Route>
              <Route index>
                <OrganizationSettings />
              </Route>
            </Switch>
          </Route>
          <Route path={isMembersPageRoot ? undefined : 'organization-members'}>
            <Switch>
              <Route
                path='invite-members'
                flowStart
              >
                <InviteMembersPage />
              </Route>
              <Route index>
                <OrganizationMembers />
              </Route>
            </Switch>
          </Route>
        </Route>
      </Switch>
    </ProfileCardContent>
  );
};
