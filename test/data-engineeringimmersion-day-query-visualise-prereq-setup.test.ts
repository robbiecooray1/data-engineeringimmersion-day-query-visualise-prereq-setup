import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DataEngineeringimmersionDayQueryVisualisePrereqSetup from '../lib/data-engineeringimmersion-day-query-visualise-prereq-setup-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DataEngineeringimmersionDayQueryVisualisePrereqSetup.DataEngineeringimmersionDayQueryVisualisePrereqSetupStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
