# Shared UI source

Web and Desktop consume this private source directory. The fixed preset is Mira,
Base UI, Zinc, Lucide and locally bundled Inter (`bdvw9FeS`). `components.json`
is the registry configuration; `provenance.json` records the generating CLI and
unmodified generation hashes. Internal imports use relative `.tsx` paths for the
existing NodeNext build. Applicable source and font notices are in `licenses/`.

`styles.css` owns semantic colors, business status colors and the shared control scale.
Web and Desktop consume the same system/light/dark preset; historical DTCG/Flutter
proofs remain historical evidence and are not imported into product CSS.

The development-only `/ui-gallery.html` route demonstrates real controls and
portals without initializing a FleetSplice or native client. It is not included
in production build inputs. Run the affected test with the qualified Node after
compiling `tsconfig.test.json`.
