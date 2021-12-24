import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  MediaCard,
  Badge
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import ApplyRandomPrices from './ApplyRandomPrices';

// GraphQL query that retrieves products by ID
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        description
        tags
        images(first: 1) {
          edges {
            node {
              originalSrc
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              title
              price
            }
          }
        }
      }
    }
  }
`;

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  // A constructor that defines selected items and nodes
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      selectedNodes: {},
    };
  }

  render() {
    const app = this.context;

    // Returns products by ID
    return (
        <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
          {({ data, loading, error, refetch }) => { // Refetches products by ID
            if (loading) return <div>Loading…</div>;
            if (error) return <div>{error.message}</div>;

            const nodesById = {};
            data.nodes.forEach(node => nodesById[node.id] = node);

            return (
              <>
                <Card>
                  <ResourceList
                    showHeader
                    resourceName={{ singular: 'Product', plural: 'Products' }}
                    items={data.nodes}
                    selectable
                    selectedItems={this.state.selectedItems}
                    onSelectionChange={selectedItems => {
                      const selectedNodes = {};
                      selectedItems.forEach(item => selectedNodes[item] = nodesById[item]);

                      return this.setState({
                        selectedItems: selectedItems,
                        selectedNodes: selectedNodes,
                      });
                    }}
                    renderItem={item => {
                      const media = (
                        <MediaCard>
                            <img alt="" width="100%" height="100%" style={{
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }} src={item.images.edges[0].node.originalSrc} />
                        </MediaCard>
                      );
                      return (
                        <ResourceList.Item
                          id={item.id}
                          media={media}
                          accessibilityLabel={`View details for ${item.title}`}
                          verticalAlignment="center"
                          onClick={() => {
                            let index = this.state.selectedItems.indexOf(item.id);
                            const node = nodesById[item.id];
                            if (index === -1) {
                                this.state.selectedItems.push(item.id);
                                this.state.selectedNodes[item.id] = node;
                            } else {
                              this.state.selectedItems.splice(index, 1);
                                delete this.state.selectedNodes[item.id];
                            }

                            this.setState({
                              selectedItems: this.state.selectedItems,
                              selectedNodes: this.state.selectedNodes,
                              });
                          }}
                        >
                            <Card title={item.title}>
                                <Card.Section>
                                    <p>{item.description}</p>
                                </Card.Section>

                                <Card.Section>
                                    <Badge>
                                        <p>{item.variants.edges[0].node.title}</p>
                                    </Badge>
                                    <Badge>
                                        <p>${item.variants.edges[0].node.price}</p>
                                    </Badge>
                                </Card.Section>
                            </Card>
                        </ResourceList.Item>
                      );
                    }}
                  />
                </Card>

              <ApplyRandomPrices selectedItems={this.state.selectedNodes} onUpdate={refetch} />
            </>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;
