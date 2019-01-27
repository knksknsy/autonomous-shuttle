import { AutonomousShuttlePage } from './app.po';

describe('autonomous-shuttle App', () => {
  let page: AutonomousShuttlePage;

  beforeEach(() => {
    page = new AutonomousShuttlePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
  });
});
