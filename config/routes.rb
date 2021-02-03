Rails.application.routes.draw do
  root :to => 'splash_page#index'
  get '/products', :to => 'products#index'
  get '/home', :to => 'home#index', as: 'home'
  mount ShopifyApp::Engine, at: '/'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
