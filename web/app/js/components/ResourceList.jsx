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

  render() {
    const {api, controllerNamespace, data, error, loading, resource} = this.props;

    if (error) return  <ErrorBanner message={error} />;
    if (loading) return <ConduitSpinner />;

    const processedMetrics = processSingleResourceRollup(
      data[0], controllerNamespace);

    const friendlyTitle = _.startCase(resource);
    return (
      <div className="page-content">
        <div>
          <PageHeader header={`${friendlyTitle}s`} api={api} />
          { _.isEmpty(processedMetrics) ?
            this.renderEmptyMessage(processedMetrics) :
            <MetricsTable
              resource={friendlyTitle}
              metrics={processedMetrics}
              api={api} />
          }
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
