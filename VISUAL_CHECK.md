# Initial Visual Verification

The patient portal renders its Harborview hero, specialty selector, availability cards, document-readiness section, and fictional-data boundary correctly at desktop width. The patient view uses the intended high-key clinical treatment with dark navy text and sea-glass accents.

The first automated reception-navigation attempt in development mode did not change the rendered view, so the client-side interaction was rechecked in the production server.

The production check passed. The standard Reception workspace navigation control switched the interface to the employee flow, rendering the intake-case list, patient search, active intake checklist, laboratory coordination panel, staff action, metrics, and scheduling-policy guidance as intended. The two flows remain visually distinct while using the same Harborview identity.
