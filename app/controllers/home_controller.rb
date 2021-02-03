# frozen_string_literal: true

class HomeController < AuthenticatedController
  # include ShopifyApp::RequiredKnownShop
  # include ShopifyApp::RequireKnownShop

  def index
    @shop_origin = current_shopify_domain
  end
end
