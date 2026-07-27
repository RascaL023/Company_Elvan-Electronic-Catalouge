{
  description = "Electronic Product Catalog - React + Vite + TypeScript";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.npm
            git
          ];

          shellHook = ''
            echo "Electronic Product Catalog development environment"
            echo "Node.js $(node --version)  |  npm $(npm --version)"
          '';
        };
      });
}
