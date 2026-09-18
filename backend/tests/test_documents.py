from backend import documents


def test_load_catalog_merges_nda_entries_into_one_document_type():
    catalog = documents.load_catalog()
    ids = [doc.id for doc in catalog]

    assert ids.count("mutual-nda") == 1
    assert len(ids) == len(set(ids))

    nda = next(doc for doc in catalog if doc.id == "mutual-nda")
    assert nda.template_filenames == (
        "Mutual-NDA.md",
        "Mutual-NDA-coverpage.md",
    )


def test_load_catalog_derives_id_from_filename():
    catalog = documents.load_catalog()
    baa = next(doc for doc in catalog if doc.template_filenames == ("BAA.md",))
    assert baa.id == "baa"


def test_slugify_field_name_produces_camel_case():
    assert documents.slugify_field_name("Effective Date") == "effectiveDate"
    assert documents.slugify_field_name("SOW Term") == "sowTerm"
    assert documents.slugify_field_name("BAA Effective Date") == "baaEffectiveDate"


def test_extract_field_names_dedupes_and_strips_possessive():
    template = (
        '<span class="keyterms_link">Provider</span> and '
        '<span class="keyterms_link">Provider\'s</span> obligations, '
        '<span class="keyterms_link">Company</span>, '
        '<span class="header_2">Not a field</span>'
    )
    assert documents.extract_field_names(template) == ["Provider", "Company"]


def test_fields_for_reads_the_real_baa_template():
    catalog = documents.load_catalog()
    baa = next(doc for doc in catalog if doc.id == "baa")
    fields = documents.fields_for(baa)

    assert "Provider" in fields
    assert "Company" in fields
    assert "Breach Notification Period" in fields
