def main(n_rows=None):
    ## SET CONFIG TO TEST
    
    CFG.isTrain = False
    
    ####################
    
    test_df = preprocess_base()
          
    with timer("Process static 0"):
        static_df, _ = preprocess_static()
        print("static df shape:", static_df.shape)
        test_df = test_df.merge(static_df, how='left', on='case_id')
        del static_df
        gc.collect()
          
    with timer("Process static cb 0"):
        static_cb, _ = preprocess_static_cb()
        print("static cb df shape:", static_cb.shape)
        test_df = test_df.merge(static_cb, how='left', on='case_id')
        del static_cb
        gc.collect()
          
    with timer("Process previous application 1"):
        applprev1, _ = preprocess_applprev1()
        print("applprev1 df shape:", applprev1.shape)
        test_df = test_df.merge(applprev1, how='left', on='case_id')
        del applprev1
        gc.collect()
    
    with timer("Process previous application 2"):
        applprev2, _ = preprocess_applprev2()
        print("static cb df shape:", applprev2.shape)
        test_df = test_df.merge(applprev2, how='left', on='case_id')
        del applprev2
        gc.collect()
    
    with timer("Process credit bureau a 1"):
        cba1, _ = preprocess_cba1()
        print("credit bureau a 1 df shape:", cba1.shape)
        test_df = test_df.merge(cba1, how='left', on='case_id')
        del cba1
        gc.collect()
          
    with timer("Process credit bureau a 2"):
        cba2, _ = preprocess_cba2()
        print("credit bureau a 2 df shape:", cba2.shape)
        test_df = test_df.merge(cba2, how='left', on='case_id')
        del cba2
        gc.collect()
          
    with timer("Process person 1"):
        person1, _ = preprocess_person1()
        print("credit person 1 df shape:", person1.shape)
        test_df = test_df.merge(person1, how='left', on='case_id')
        del person1
        gc.collect()
    
    with timer("Process person 2"):
        person2, _ = preprocess_person2()
        print("credit person 2 df shape:", person2.shape)
        test_df = test_df.merge(person2, how='left', on='case_id')
        del person2
        gc.collect()
    
    with timer("Drop high correlation > 0.95"):
        uses = filter_high_correlation(test_df)
        test_df = test_df[uses]
    
    print('Final test_df shape: ', test_df.shape)
    
    if n_rows:
        test_df = test_df.iloc[:n_rows]
    
    with timer("Run LightGBM with kfold"):
          kfold_lgbm(test_df, 5)