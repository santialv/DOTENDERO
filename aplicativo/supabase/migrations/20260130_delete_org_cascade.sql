-- SQL Reference for deleting an organization and all its children
CREATE OR REPLACE FUNCTION delete_organization_cascade(p_org_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 1. Delete dependent transactional data
    DELETE FROM public.invoice_items WHERE organization_id = p_org_id;
    DELETE FROM public.invoices WHERE organization_id = p_org_id;
    DELETE FROM public.cash_movements WHERE shift_id IN (SELECT id FROM public.cash_shifts WHERE organization_id = p_org_id);
    DELETE FROM public.cash_shifts WHERE organization_id = p_org_id;
    DELETE FROM public.inventory_movements WHERE organization_id = p_org_id;
    
    -- 2. Delete static data
    DELETE FROM public.products WHERE organization_id = p_org_id;
    DELETE FROM public.categories WHERE organization_id = p_org_id;
    DELETE FROM public.customers WHERE organization_id = p_org_id;
    DELETE FROM public.suppliers WHERE organization_id = p_org_id; -- If it exists
    DELETE FROM public.expenses WHERE organization_id = p_org_id; -- If it exists
    
    -- 3. Dissociate users (Profiles)
    -- We don't delete the user (auth.users), but we clean their profile organization link
    UPDATE public.profiles 
    SET organization_id = NULL, 
        home_organization_id = NULL 
    WHERE organization_id = p_org_id OR home_organization_id = p_org_id;

    -- 4. Finally delete the organization
    DELETE FROM public.organizations WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_organization_cascade(UUID) TO postgres, service_role, authenticated;
