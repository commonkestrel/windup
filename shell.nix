{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    rustc
    cargo
    cargo-tauri
    pkg-config
    cairo
    pango
    libsoup
    gdk-pixbuf
    atkmm
    webkitgtk
  ];
}