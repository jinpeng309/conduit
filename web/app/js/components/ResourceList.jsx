import _ from 'lodash';
import CallToAction from './CallToAction.jsx';
import ConduitSpinner from "./ConduitSpinner.jsx";
import ErrorBanner from './ErrorBanner.jsx';
import MetricsTable from './MetricsTable.jsx';
import PageHeader from './PageHeader.jsx';
import { processSingleResourceRollup } from './util/MetricUtils.js';
import React from 'react';
import withREST from './util/withREST.jsx';
import './../../css/list.css';
import 'whatwg-fetch';

export class ResourceList extends React.Component {
  renderEmptyMessage = () => {
    let shortResource = this.props.resource === "replication_controller" ?
      "RC" : this.props.resource;
    return (<CallToAction
      resource={shortResource}
      numResources={0} />);
  }

  banner = () => {
    const {error} = this.props;

    if (!error) {
      return;
    }

    return <ErrorBanner message={error} />;
  }

  content = () => {
    const {api, controllerNamespace, data, loading} = this.props;

    if (loading) {
      return <ConduitSpinner />;
    }

    let processedMetrics = [];
    if (_.has(data, '[0].ok')) {
      processedMetrics = processSingleResourceRollup(
        data[0], controllerNamespace);
    }

    if (_.isEmpty(processedMetrics)) {
      return this.renderEmptyMessage();
    }

    const friendlyTitle = _.startCase(this.props.resource);

    return (
      <MetricsTable
        resource={friendlyTitle}
        metrics={processedMetrics}
        api={api} />
    );
  }

  render() {
    const {api, resource} = this.props;

    const friendlyTitle = _.startCase(resource);

    return (
      <div className="page-content">
        <div>
          {this.banner()}
          <PageHeader header={`${friendlyTitle}s`} api={api} />
          {this.content()}
        </div>
      </div>
    );
  }
}

export default withREST(
  ResourceList,
  ({api, resource}) => [api.fetchMetrics(api.urlsForResource(resource))],
  ['resource'],
);
